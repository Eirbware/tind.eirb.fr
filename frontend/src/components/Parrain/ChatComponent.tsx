import React from 'react';
import { Fillot } from '../../views/ParrainView';
import LeftBubble from '../LeftBubble';
import RightBubble from '../RightBubble';
import formInit from '../../data/formInit.json';
import formAlt from '../../data/formAlt.json';

type FormQuestion = 
  | { type: 'text'; question: string | string[] } 
  | { type: 'qcm'; question: string; option: string[] };

const formInitTyped: FormQuestion[] = formInit as FormQuestion[];
const formAltTyped: FormQuestion[] = formAlt as FormQuestion[];

interface ChatComponentProps {
  activeFillot: Fillot;
  user: any;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ activeFillot, user }) => {
  const form = activeFillot.diploma.startsWith("IAE") ? formAltTyped : formInitTyped;

  const getPokemonType = (diploma: string) => {
    switch (diploma.slice(0, 5)) {
      case "IIEIN": {
        return "Nymphormaticien.ne";
      }
      case "IIETE": {
        return "Telecon.ne";
      }
      case "IIEMM": {
        return "Matmesboules";
      }
      case "IIEEL": {
        return "Electrocon.ne";
      }
      default: {
        return "animal.e.s";
      }
    }
  };

  const replacePlaceholders = (text: string): string => {
    return text.replace(/{fillotName}/g, activeFillot.firstName);
  };

  const renderConversation = () => {
    if (!activeFillot.infos?.res) {
      return (
        <p className='text-gray-800 dark:text-gray-200 text-center w-full'>
          Aucune réponse disponible.
        </p>
      );
    }

    return activeFillot.infos.res.map((response, index) => {
      const question = form[index];

      if (question.type === 'text') {
        if (Array.isArray(question.question)) {
          return (
            <React.Fragment key={index}>
              {question.question.map((q, idx) => (
                <LeftBubble 
                  key={idx} 
                  sender={idx === 0 ? 'Tind\'eirb' : ''} 
                  message={replacePlaceholders(q)} 
                  senderId={user.id} 
                />
              ))}
              <RightBubble sender={activeFillot.firstName} message={response} senderId={activeFillot.id} />
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={index}>
              <LeftBubble sender="Tind'eirb" message={replacePlaceholders(question.question)} senderId={user.id} />
              <RightBubble sender={activeFillot.firstName} message={response} senderId={activeFillot.id} />
            </React.Fragment>
          );
        }
      } else if (question.type === 'qcm') {
        return (
          <React.Fragment key={index}>
            <LeftBubble sender="Tind'eirb" message={question.question} senderId={user.id} />
            <div className="w-full flex flex-wrap gap-2 justify-around p-4">
              {question.option.map((opt, idx) => (
                <button
                  key={idx}
                  className='btn bg-rose-500 text-white rounded-full px-4 py-2 border-2 border-rose-700 opacity-75 cursor-not-allowed'
                  style={{
                    maxWidth: '80vw', 
                    wordWrap: 'break-word', 
                    whiteSpace: 'normal', 
                    minHeight: '40px', 
                    height: 'auto', 
                    lineHeight: '1.5', 
                    backgroundColor: '#DC2626', 
                    borderColor: '#B91C1C', 
                    opacity: 0.8, 
                    color: '#FFFFFF' 
                  }}
                  disabled
                >
                  {opt}
                </button>
              ))}
            </div>
            <RightBubble sender={activeFillot.firstName} message={response} senderId={activeFillot.id} />
          </React.Fragment>
        );
      } else {
        return null;
      }
    });
  };

  return (
    <>
      <p className='text-gray-800 dark:text-gray-200 text-center w-full'>
        Début de votre discussion avec {activeFillot.firstName}
      </p>
      <p className='text-gray-800 dark:text-gray-200 text-center w-full'>
        Ce Pokémon est de type {getPokemonType(activeFillot.diploma)} 
      </p>
      {renderConversation()}
    </>
  );
};

export default ChatComponent;
