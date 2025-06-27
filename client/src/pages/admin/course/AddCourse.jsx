import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const AddCourse = () => {
  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");

  const [createCourse, {data, isLoading, error, isSuccess}] = useCreateCourseMutation();

  const navigate = useNavigate();
  
  const getSelectedCategory = (value)=>{
    setCategory(value);
  }

  const createCourseHandler = async()=>{
    await createCourse({courseTitle, category});
  };

  //for displaying toasts:
  useEffect(()=>{
    if(isSuccess){
      toast.success(data?.message || "Course Created");
      navigate("/admin/course");
    }
  }, [isSuccess, error]);

  return (
    <div className="flex-1 mx-10">
      <div className="mb-4">
        <h1 className="font-bold text-xl">
          Lets add course, add some basic details for your new course
        </h1>
        <p className="text-sm">Woooahhhhh, Lesgoooo and create it!!</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            type="text"
            value={courseTitle}
            onChange={(e)=>setCourseTitle(e.target.value)}
            placeholder="Your Course Name"
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={getSelectedCategory} >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="NextJs">NextJs</SelectItem>
                <SelectItem value="DataScience">DataScience</SelectItem>
                <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                <SelectItem value="Fullstack Developer">Fullstack Developer</SelectItem>
                <SelectItem value="MERN Stack Developer">MERN Stack Developer</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="Docker">Docker</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="React">React</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={()=>(navigate(`/admin/course`))}>Back</Button>
          <Button disabled={isLoading} onClick={createCourseHandler}>
            {
              isLoading? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Please Wait
                </>
              ) : "Create"
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
