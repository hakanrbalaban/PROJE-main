import React from 'react';

const Groups = () => {
    const groupsData = [
        { id: 1, name: 'React Developers', members: '120k' },
        { id: 2, name: 'Vite Fans', members: '45k' },
        { id: 3, name: 'Tailwind CSS Mastery', members: '80k' },
    ];

    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold mb-5 dark:text-gray-200">Suggested Groups</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupsData.map(group => (
                    <div key={group.id} className="bg-white dark:bg-[#222] p-5 rounded-lg shadow-md flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-blue-500 rounded-full"></div>
                        <h3 className="font-semibold dark:text-gray-200">{group.name}</h3>
                        <span className="text-sm text-gray-500">{group.members} Members</span>
                        <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm">Join Group</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Groups;
