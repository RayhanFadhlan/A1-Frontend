import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { BookText, ChevronRight } from "lucide-react";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";
import ReviewForm from "@/components/student/course-content/review-form";
import { getUserId, getUserRole, getUserToken } from "@/app/actions/auth/auth-actions";
import { Assignment, Content, Rating } from "@/app/types";
import { redirect } from "next/navigation";
import Image from "next/image";
import ContentList from "@/components/student/course-content/content-list";

async function getContents(courseId: string, token: string) {
  const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/contents`,
      { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.contents;
}

async function getContent(courseId: string, contentId: string, token: string) {
  const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/contents/${contentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.content;
}

async function getReviews(courseId: string, token: string) {
  const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/ratings`,
      { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.ratings;
}

async function getAssignments(courseId: string, token: string) {
  try {
    const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}/assignments`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.assignments;
  } catch (error) {
    console.error("Error during purchase:", error);
    return [];
  }
}

export default async function CourseContent({
                                              params,
                                            }: {
  params: {
    courseId: string;
    contentId: string;
  };
}) {
  const userId = await getUserId();
  const userToken = await getUserToken();
  if (!userToken) {
    redirect("/auth/sign-in");
  }

  const userRole = await getUserRole();
  if (userRole !== "user") {
    redirect("/");
  }

  const contents = await getContents(params.courseId, userToken);
  // const content = await getContent(params.courseId, params.contentId, userToken);
  let content;
  if (params.contentId === "1") {
    content = contents[0];
  } else {
    content = await getContent(params.courseId, params.contentId, userToken);
  }
  const reviews = await getReviews(params.courseId, userToken);
  const pdfLink = content.file;
  const assignments = await getAssignments(params.courseId, userToken);

  return (
      <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <div className="flex flex-col gap-6">
              <div className="text-primary text-xl font-semibold pb-4">
                {content.title}
              </div>
              <div
                  className="aspect-[16/9] bg-muted rounded-lg"
                  style={{ height: "50vh", minHeight: "300px" }}
              >
                <embed
                    src={pdfLink}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                />
              </div>
              <Tabs defaultValue="assignment">
                <TabsList className="flex w-full overflow-x-auto">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="assignment">Assignment</TabsTrigger>
                  <TabsTrigger value="reviews">Student Feedback</TabsTrigger>
                </TabsList>
                <TabsContent value="description">
                  <div className="p-4 bg-background rounded-lg">
                    <h3 className="text-lg font-medium">Content Description</h3>
                    <p>{content.description}</p>
                  </div>
                </TabsContent>
                <TabsContent value="assignment">
                  <div className="p-4 bg-background rounded-lg">
                    <h3 className="text-lg font-medium">Assignment</h3>
                    <div className="grid gap-2 mt-4">
                      {assignments.map((assignment: Assignment) => (
                          <Link
                              href={`/courses/learn/${params.courseId}/assignment/${assignment.id}`}
                              className="flex items-center justify-between hover:bg-muted/50 px-2 py-1 rounded-md"
                              prefetch={false}
                              key={assignment.id}
                          >
                            <div className="flex items-center justify-start gap-4">
                              <div className="hidden sm:block sm:flex-shrink-0 sm:w-[40px] sm:h-[40px] mr-4 mb-2 sm:mb-0">
                                <Image src="/assets/instructor/icon-assignment.png" alt="Assignment Icon" width={40} height={40}/>
                              </div>
                              <div className="flex flex-col">
                                <h2 className="text-md font-semibold">
                                  {assignment.title}
                                </h2>
                                <h3 className="text-sm text-primary max-h-5 overflow-hidden">
                                  {assignment.description}
                                </h3>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4"/>
                          </Link>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="reviews">
                  <div className="p-4 bg-background rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Feedback</h3>
                      <ReviewForm
                          courseId={params.courseId}
                          userId={userId}
                          token={userToken}
                      />
                    </div>
                    <div className="grid gap-4 mt-4">
                      {reviews.map((review: Rating) => (
                          <div className="p-4 bg-muted/20 rounded-lg" key={review.id}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>
                                    {review.user_name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{review.user_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-500">
                                {Array.from({ length: review.rating }).map(
                                    (_, index) => (
                                        <Star
                                            key={index}
                                            className="w-4 h-4 fill-yellow-500"
                                        />
                                    )
                                )}
                              </div>
                            </div>
                            <p className="mt-4 text-muted-foreground">
                              {review.comments}
                            </p>
                          </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <div className="flex flex-col gap-6 mt-6 lg:mt-0">
              <div className="p-4 bg-background rounded-lg">
                <h3 className="text-lg font-medium">Content</h3>
                <ContentList
                    contents={contents}
                    courseId={params.courseId}
                    userId={userId}
                    userToken={userToken}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}