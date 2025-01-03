const TweetVideoThumbs = ({ videos }: { videos: string[] | undefined }) => {
  if (!videos || videos.length === 0) return;
  return (
    <div className={'flex gap-2'}>
      {videos.map(pic => {
        return (
          <a key={pic} href={pic} target="_blank" rel="noopener noreferrer" className="">
            <img
              className="clickable size-16 object-cover border-gray-300/20 rounded-lg animate-fadeIn fade-in-40"
              src={pic}
              alt=""
            />
          </a>
        );
      })}
    </div>
  );
};

export default TweetVideoThumbs;
