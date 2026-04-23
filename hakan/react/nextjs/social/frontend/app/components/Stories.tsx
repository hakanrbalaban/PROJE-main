const stories = [
  { id: 1, username: "Duman", img: "/cat.jpg" },
  { id: 2, username: "User2", img: "/user2.jpg" },
  // ...
];

export default function Stories() {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm overflow-x-auto flex gap-4 scrollbar-hide">
      {/* Story Ekleme */}
      <div className="flex flex-col items-center gap-2 cursor-pointer min-w-[70px]">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
          +
        </div>
        <span className="text-xs font-medium">Add Story</span>
      </div>
      {/* Story Listesi */}
      {stories.map(story => (
        <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer min-w-[70px]">
          <img src={story.img} className="w-16 h-16 rounded-full ring-2 ring-blue-500 p-1 object-cover" />
          <span className="text-xs font-medium">{story.username}</span>
        </div>
      ))}
    </div>
  );
}