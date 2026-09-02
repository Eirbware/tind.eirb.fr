import React, { useEffect, useState } from 'react';
import membersData from '../data/members.json';

import '../assets/styles/PhotoBackground.css';

interface Member {
  name: string;
  age: number;
  photo: string;
  id: string;
}

const PhotosBackground: React.FC = () => {
  const [randomMembers, setRandomMembers] = useState<Member[]>([]);

  useEffect(() => {
    const updateRandomMembers = () => {
      const random = membersData.sort(() => Math.random() - 0.5);
      setRandomMembers(random.concat(random.map(m => ({ ...m, id: m.id + '2' }))));
    };

    updateRandomMembers();
    const interval = setInterval(updateRandomMembers, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="photos-background" className="fixed top-0 left-0 z-[-1] w-[calc(100vw+800px)] h-[calc(100vh+1000px)] ml-[-400px] mt-[-500px] rotate-[25deg] bg-[#010101] flex flex-wrap overflow-hidden">
      {randomMembers.map(membre => (
        <div key={membre.id} className="phone bg-[#2a2a2a] border-r-[12px] border-[#2a2a2a] rounded-[24px] m-[8px 14px]">
          <div className="screen w-full h-full border-[5px] border-[#686868] rounded-[24px] bg-white shadow-inner">
            <div className="encoche mx-auto bg-[#686868] rounded-b-[12px] w-[132px] h-[18px]"></div>
            <img src="/img/tinder.svg" alt="tinder" className="logo mx-auto mt-[3px] mb-[7px] w-[22px] h-[22px]" />
            <div
              className="photo w-[226px] h-[350px] mx-auto rounded-[10px] bg-cover bg-center relative overflow-hidden"
              style={{ backgroundImage: `url(${membre.photo})` }}
            >
              <div className="description absolute bottom-0 w-full flex justify-between items-center p-[14px 12px] bg-gradient-to-t from-black via-transparent to-transparent">
                <span className="name text-white font-bold text-[20px] flex items-center">
                  {membre.name},<span className="age text-white font-normal text-[17px] ml-2">{membre.age}</span>
                  <img src="/img/check.svg" alt="verified" className="verified ml-2 mt-1 w-[20px] h-[20px]" />
                </span>
                <img src="/img/info.svg" alt="info" className="info w-[16px] h-[16px]" />
              </div>
            </div>
            <div className="buttons w-[190px] h-[60px] flex justify-around items-center mx-auto mt-[8px]">
              {['reload', 'x', 'star', 'heart', 'bolt'].map(icon => (
                <img
                  key={icon}
                  src={`./img/${icon}.svg`}
                  alt={icon}
                  className="w-[16px] h-[16px] rounded-full p-[7px] shadow-md box-content"
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotosBackground;

