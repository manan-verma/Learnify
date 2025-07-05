import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.js";

export const getCourseProgress = async(req, res)=>{
    try {
        let {courseId} = req.params;
        const userId = req.id;

        //step1 - fetch the user course progress
        let courseProgress = await CourseProgress.findOne({courseId, userId}).populate("courseId");
        const courseDetails = await Course.findById(courseId).populate("lectures");
        if(!courseDetails){
            return res.status(404).json({
                message: "course not found"
            })
        }

        //step2 -- if no progress found,(course start nhi kra abhi tk) return courseDetails with empty details
        if(!courseProgress) {
            return res.status(200).json({
                data:{
                    courseDetails,
                    progress: [],
                    completed: false
                }
            })
        }
        
        //course start ho gya
        //step3: return the user course progress with course detail
        return res.status(200).json({
            data:{
                courseDetails,
                progress: courseProgress.lectureProgress,
                completed: courseProgress.completed,
            }
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateLectureProgess = async(req,res)=>{
    try {
        const {courseId, lectureId} = req.params;
        const userId = req.id;

        //fetch or create course progress
        let courseProgress = await CourseProgress.findOne({courseId, userId});
        if(!courseProgress){
            //if no progress exist , create new progress
            courseProgress = new CourseProgress({
                userId,
                courseId,
                completed: false,
                lectureProgress: []
            })
        }

        //finding the lecture progress in the course progress
        const lectureIndex = courseProgress.lectureProgress.findIndex((lecture)=> lecture.lectureId === lectureId);
        //if lecture already exist, update its status
        if(lectureIndex !== -1){
            courseProgress.lectureProgress[lectureIndex].viewed = true;
        }else{
            //no lecture exist ---> add new lecture progress
            courseProgress.lectureProgress.push({lectureId, viewed: true});
        }
        
        //if all lectures are completed then course complete button true
        const lectureProgressLength = courseProgress.lectureProgress.filter((lectureProg)=>lectureProg.viewed).length;
        const course = await Course.findById(courseId);

        if(course.lectures.length === lectureProgressLength){
            //course ke all lectures viewed h mtlb course progress true krna h
            courseProgress.completed = true;
        }

        await courseProgress.save();

        return res.status(200).json({
            message: "Lecture progress updated successfully"
        })
    } catch (error) {
        console.log(error);
    }
}

export const markAsCompleted = async(req, res)=>{
    try {
        const {courseId} = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({courseId, userId});
        if(!courseProgress){
            return res.status(404).json({
                message: "Course progress not found"
            })
        }
        //map return an new array in which viewed lectures is true
        courseProgress.lectureProgress.map((lectureProgress)=>lectureProgress.viewed = true);
        courseProgress.completed = true;
        await courseProgress.save();
        return res.status(200).json({
            message: "Course marked as completed."
        });

    } catch (error) {
        console.log(error);
    }
}

export const markAsInCompleted = async(req, res)=>{
    try {
        const {courseId} = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({courseId, userId});
        if(!courseProgress){
            return res.status(404).json({
                message: "Course progress not found"
            })
        }
        //map return an new array in which viewed lectures is true
        courseProgress.lectureProgress.map((lectureProgress)=>lectureProgress.viewed = false);
        courseProgress.completed = false;
        await courseProgress.save();
        return res.status(200).json({
            message: "Course marked as incompleted."
        });

    } catch (error) {
        console.log(error);
    }
}


