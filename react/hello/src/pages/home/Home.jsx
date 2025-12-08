import React from 'react';
import './home.css'
import Share from '../../components/share/Share';
import Posts from '../../components/posts/Posts';

const Home = () => {
    return (
        <div className="home p-5 lg:p-[20px] 2xl:p-[50px] w-full max-w-[1000px] mx-auto">
            <Share />
            <Posts />
        </div>
    );
};


export default Home;
