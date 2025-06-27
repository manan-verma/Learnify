import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi.js";
import { BadgeInfo, Car, Lock, PlayCircle } from "lucide-react";
import React from "react";
import { useParams } from "react-router";

const CourseDetail = () => { 
    // const purchasedCourse = false;
    const params = useParams();
    const courseId = params.courseId;

    const {data, isLoading, isError} = useGetCourseDetailWithStatusQuery(courseId);

    if(isLoading) return <h1>Loading...</h1>
    if(isError) return <h1>Failed to load course details</h1>

    const {course, purchased} = data;

  return (
    <div className="mt-16 space-y-5">
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">{course?.courseTitle}</h1>
          <p className="text-base md:text-lg">Course Subtitle</p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">{course?.creator.name}</span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last Updated {course?.createdAt.split("T")[0]}</p>
          </div>
          
        </div>
      </div>
      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10 ">
        <div className="w-full lg:w-1/2 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores,
            est! Lorem, ipsum dolor sit amet consectetur adipisicing elit.
            Provident, necessitatibus.
          </p>
          <Card className='pt-6'>
            <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                    4 lectures
                </CardDescription>
                <CardContent className='space-y-3'>
                    {
                        [1,2,3].map((lecture, idx)=>(
                            <div key={idx} className="flex items-center gap-3 text-sm ">
                               <span>
                                    {
                                        true? (<PlayCircle size={14}/>): (<Lock size={14}/>)
                                    }
                                </span> 
                                <p>Lecture title</p>
                            </div>
                        ))
                    }
                </CardContent>
            </CardHeader>
          </Card>
        </div>
        <div className="w-full lg:w-1/3">
            <Card>
                <CardContent className='p-4 flex flex-col'>
                    <div className="w-full aspect-video mb-4">
                        React Video aayega
                    </div>
                    <h1>Lecture title</h1>
                    <Separator className='my-2'/>
                    <h1 className="text-lg md:text-xl font-semibold">Course Price</h1>
                </CardContent>
                <CardFooter className='flex justify-center p-4'>
                    {
                        purchased ? (
                            <Button className='w-full'>Continue Course</Button>
                        ) : <BuyCourseButton courseId={courseId}/>
                    }
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
