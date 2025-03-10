import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cardPhoto from '../assets/Images/teacher.jpg';
import rupee from '../assets/Images/rupee.png';
import { useQuery } from 'react-query';
import { popularCourses } from '../ApiFunctions/api';

const PopularCourses = () => {
  const [content, setContent] = useState([]);
  const [images, setImages] = useState({});
  
  const { data, isLoading, isError } = useQuery(
    ["popularCourses"],
    () => popularCourses(),
    {
      enabled: true,
      onSuccess: (data) => {
        const { result } = data.data;
        setContent(result);
      }
    }
  );

  useEffect(() => {
    const fetchImages = async () => {
      const imagePromises = content.map(async (box) => {
        try {
          // Fetch both thumbnail and cover images
          const coverResponse = await fetch(
            `${import.meta.env.VITE_IMAGE_BASE_URL}/${box.coursePreviewCover}`
          );
          if (!coverResponse.ok) throw new Error('Cover image not found');
          
          const blob = await coverResponse.blob();
          return URL.createObjectURL(blob);
        } catch (error) {
          console.error('Error loading image:', error);
          return null;
        }
      });

      const imageResults = await Promise.all(imagePromises);
      const imageMap = imageResults.reduce((acc, url, index) => {
        if (url) acc[content[index]._id] = url;
        return acc;
      }, {});

      setImages(imageMap);
    };

    if (content.length > 0) {
      fetchImages();
    }

    // Cleanup function to revoke object URLs
    return () => {
      Object.values(images).forEach(url => URL.revokeObjectURL(url));
    };
  }, [content]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (isError) {
    return <div className="flex justify-center items-center h-screen">Error loading popular courses</div>;
  }

  return (
    <div className="w-full min-h-44 max-w-[1420px] pl-[10px] pr-[10px] pb-10 mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xl font-bold">Popular Courses</h3>
        <Link to="/popularcourses">
          <button className="bg-red-500 text-white py-2 px-4 rounded">
            View more
          </button>
        </Link>
      </div>

      <div className="boxWrapper w-full flex flex-col flex-wrap md:flex-row items-center gap-6">
        {content.map((box) => (
          <Link
            to={`/coursesinfopage/${box._id}`}
            key={box._id}
            className="box lg:max-w-[500px] shadow-lg rounded-lg overflow-hidden"
          >
            <div className="imageContainer h-48 relative">
              <img
                className="h-full w-full object-cover"
                src={images[box._id] || cardPhoto}
                alt={box.courseTitle}
                onError={(e) => {
                  e.target.src = cardPhoto;
                }}
              />
            </div>
            <div className="textContainer p-4">
              <h3 className="text-xl md:text-xl lg:text-2xl font-semibold text-[#0B104A] line-clamp-2">
                {box.courseTitle}
              </h3>
              <div 
                className="text-sm mt-2 line-clamp-3 text-gray-600"
                dangerouslySetInnerHTML={{ __html: box.longDescription }}
              />
              <h3 className="flex items-center mt-4 text-2xl font-bold text-[#000000c4]">
                <img className="h-5 mt-1 opacity-70" src={rupee} alt="rupee" />
                {box.isCourseFree === "free" ? "0" : box.price}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularCourses;