import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia} from "../utils/cloudinary.js"

export const createCourse= async(req, res)=>{
    try {
        const {courseTitle, category} = req.body;
        if(!courseTitle || !category){
            return res.status(400).json({
                message: "Course title and category is required",
            })
        }

        //if exists then create course:
        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id
        });

        return res.status(201).json({
            course,
            message: "Course created."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"
        })
    }
}

export const getPublishedCourse = async(req, res)=>{
    try {
        const courses = await Course.find({isPublished: true}).populate({path: "creator", select:"name photoUrl"});
        //.populate taki course kisne publish kra h uska naam aur image dikh ske
        if(!courses){
            res.status(404).json({
                message: "Course not found"
            })
        }

        res.status(200).json({
            courses,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to get published courses"
        })
    }
}

export const getCreatorCourses = async(req, res)=>{
    try {
        const userId = req.id;
        const courses = await Course.find({creator: userId});
        if(!courses){
            return res.status(404).json({
                course: [],
                message: "Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course",
            success: false
        })
    }
}

export const editCourse = async(req, res)=>{
    try {
        const courseId = req.params.courseId;
        const {courseTitle, subTitle, description, category, courseLevel, coursePrice} = req.body;
        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message: "Course not found"
            })
        }
        let courseThumbnail;
        //deleting the already existing thumbnail as new thumbanil was uploaded;
        if(thumbnail){
            if(course.courseThumbnail){
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId); //dlt old image
            }
            //upload new thumbnail on cloudinray
            courseThumbnail = await uploadMedia(thumbnail.path);
        }

        const updateData = {
            courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail: courseThumbnail?.secure_url
        }

        course = await Course.findByIdAndUpdate(courseId, updateData, {new:true});

        return res.status(200).json({
            course,
            message: "Course updated successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course",
            success: false
        })
    }
} 


export const getCourseById = async(req,res)=>{
    try {
        const {courseId}  = req.params;
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message: "Course not found!"
            })
        }
        return res.status(200).json({
            course
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get course by id",
            success: false
        })
    }
}

export const createLecture = async(req,res)=>{
    try {
        const {lectureTitle} = req.body;
        const {courseId} = req.params; //taki pta rhe ki yeh lecture kis course ka h.
        if(!lectureTitle || !courseId){
            return res.status(400).json({
                success: false,
                message:" Lecture title is required!"
            })
        }

        //create lecture:
        const lecture = await Lecture.create({lectureTitle});

        const course = await Course.findById(courseId);
        if(course){
            course.lectures.push(lecture._id); 
            await course.save();
        }

        return res.status(201).json({
            lecture,
            message: "Lecture created successfully",
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create lecture"
        })
    }
}

export const getCourseLecture = async(req,res)=>{
    try {
        const {courseId} = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if(!course){
            res.status(404).json({
                message: "Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        }); 

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get lectures"
        })
    }
}


export const editLecture = async (req,res)=>{
    try {
        const {lectureTitle, videoInfo, isPreviewFree} = req.body;
        const {courseId, lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message: "Lecture not found!"
            })
        }

        //update lecture
        if(lectureTitle) lecture.lectureTitle = lectureTitle;
        if(videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
        if(videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        lecture.isPreviewFree = isPreviewFree;

        await lecture.save();

        //ensure the course still has the lecture id if it is not already added.
        const course = await Course.findById(courseId);
        if(course && !course.lectures.includes(lecture._id)){
            course.lectures.push(lecture._id);
            await course.save();
        }

        return res.status(200).json({
            lecture,
            message: "Lecture updated successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to edit lecture"
        })
    }
}

export const removeLecture = async(req, res)=>{
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if(!lecture){
            return res.status(404).json({
                message: "Lecture not found!"
            })
        }

        //delete the lecture from cloudinary as well.
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        //remove lecture refernce from the associated course:
        await Course.updateOne(
            {lectures: lectureId}, //finding the course jismein yeh id wala lecture ho
            {$pull: {lectures: lectureId}}  //pull method of mongoDb, it delete the lecture id from lecture array
        )

        return res.status(200).json({
            message: "Lecture removed successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to remove lecture"
        })
    }
}

export const getLectureById = async(req,res)=>{
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if(!lecture){
            return res.status(404).json({
                message: "Lecture not found"
            })
        }
        return res.status(200).json({
            lecture,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get lecture by id"
        })
    }
}



//publish unpublish course logic:
export const togglePublishCourse = async(req, res)=>{
    try {
        const {courseId} = req.params;
        const {publish} = req.query; //true or false
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message: "Course not found"
            })
        }

        //publish status based on the query parameter:
        course.isPublished = publish === "true"; //condition match toh publish set true
        await course.save();
        
        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message: `Course is ${statusMessage}`
        })
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            message: "Failed to update status"
        })

    }
}