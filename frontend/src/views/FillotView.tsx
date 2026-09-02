import React, { useEffect, useState, useRef } from 'react';
import { User } from '../types';
import Avatar from '../components/Avatar';
import LeftBubble from '../components/LeftBubble';
import RightBubble from '../components/RightBubble';

import formInit from '../data/formInit.json';
import formAlt from '../data/formAlt.json';

const TINDEIRB_ID = 'tindeirb';

// Define the type corresponding to the structure of your questions
type FormQuestion =
  | { type: 'text'; question: string | string[] }
  | { type: 'qcm'; question: string; option: string[] };

// Explicitly type the JSON files
const formInitTyped: FormQuestion[] = formInit as FormQuestion[];
const formAltTyped: FormQuestion[] = formAlt as FormQuestion[];

interface FillotViewProps {
  user: User;
  pb: any;
  logout: () => void;
  isAuthenticated: () => boolean;
  setUser: (user: any) => void;
}

const FillotView: React.FC<FillotViewProps> = ({ user, logout, pb, setUser }) => {
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<FormQuestion[]>(formInitTyped.length > formAltTyped.length ? formInitTyped : formAltTyped);
  const [inputError, setInputError] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);

  /*
    Update the form based on the user's diploma.
    Switch to an alternative form if the diploma starts with "IAE".
  */
  useEffect(() => {
    if (user && user.diplome) {
      setForm(user.diplome.startsWith("IAE") ? formAltTyped : formInitTyped);
    }
  }, [user]);

  /*
    Scroll to the bottom of the conversation when new messages are added.
  */
  const scrollToBottom = () => {
    if (conversationRef.current) {
      conversationRef.current.scrollTo({
        top: conversationRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  /*
    Handle gender selection and update user info in the database.
  */
  const handleGenderSelection = (gender: string) => {
    const updatedInfos = { ...user.infos, sex: gender };

    pb.collection("users").update(user.id, { infos: updatedInfos })
      .then(() => setUser({ ...user, infos: updatedInfos }))
      .catch((error: any) => console.error("Error updating gender:", error));
  };

  /*
    Handle editing a message at a specific index.
  */
  const handleEditMessage = (index: number, newMessage: string) => {
    const responses = user.infos?.res || [];

    // Fonction pour scinder les mots de plus de 35 caractères
    const splitLongWords = (str: string) => {
      return str.split(' ').map(word =>
        word.length > 25 ? word.match(/.{1,25}/g)?.join(' ') : word
      ).join(' ');
    };

    const processedMessage = splitLongWords(newMessage);

    // Modify Messages
    const updatedRes = [...responses];
    updatedRes[index] = processedMessage;

    const updatedInfos = { ...user.infos, res: updatedRes };

    pb.collection("users").update(user.id, { infos: updatedInfos })
      .then(() => {
        setUser({ ...user, infos: updatedInfos });
      })
      .catch((error: any) => console.error("Error updating message:", error));
  };

  /*
    Handle sending a message in the conversation.
    - If a specific text is provided, use it; otherwise, use the current message state.
    - Validate that the message is not empty before sending.
    - Split words longer than 35 characters.
    - Update the user's response list and reset the message state.
  */
  const handleSendMessage = (text?: string) => {
    const msg = text || message.trim();
    if (msg === '') {
      setInputError(true);
      return;
    }

    // Réinitialiser l'erreur si le message n'est pas vide
    setInputError(false);

    // Fonction pour scinder les mots de plus de 35 caractères
    const splitLongWords = (str: string) => {
      return str.split(' ').map(word =>
        word.length > 25 ? word.match(/.{1,25}/g)?.join(' ') : word
      ).join(' ');
    };

    const processedMessage = splitLongWords(msg);

    const updatedRes = user.infos?.res ? [...user.infos.res, processedMessage] : [processedMessage];
    const updatedInfos = { ...user.infos, res: updatedRes };

    pb.collection("users").update(user.id, { infos: updatedInfos })
      .then(() => {
        setUser({ ...user, infos: updatedInfos });
        setMessage('');
        scrollToBottom();
      })
      .catch((error: any) => console.error("Error sending message:", error));
  };

  /*
    Handle the Enter key to send a message when the user presses Enter.
  */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /*
    Handle input change to update the message state.
  */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setInputError(false);
  };

  /*
    Render gender selection options when the user has not yet chosen their gender.
  */
  const renderGenderSelection = () => (
    <>
      <LeftBubble sender="Tind'eirb" message={`Salut ${user.firstName}, comment vas-tu ?`} senderId={TINDEIRB_ID} />
      <LeftBubble sender="" message="Je vais te demander de répondre à quelques questions pour en apprendre plus sur toi !" senderId={TINDEIRB_ID} />
      <LeftBubble sender="" message="Pour commencer, comment veux-tu que l'on te genre ?" senderId={TINDEIRB_ID} />
      <div className="w-full flex justify-around p-4">
        <button className='btn bg-rose-500 text-white rounded-full px-4 py-2' onClick={() => handleGenderSelection('M')}>Homme</button>
        <button className='btn bg-rose-500 text-white rounded-full px-4 py-2' onClick={() => handleGenderSelection('F')}>Femme</button>
        <button className='btn bg-rose-500 text-white rounded-full px-4 py-2' onClick={() => handleGenderSelection('none')}>Autre</button>
      </div>
    </>
  );

  /*
    Render the conversation between the user and "Tind'eirb".
    Display each question and response, handling both text and QCM types.
  */
  const renderConversation = () => {
    const responses = user.infos?.res || [];
    const currentQuestionIndex = responses.length;
    const currentQuestion = form[currentQuestionIndex];

    return (
      <>
        {responses.map((response: string, index: number) => {
          const question = form[index];
          return (
            <React.Fragment key={index}>
              {question.type === 'text' ? (
                Array.isArray(question.question) ? question.question.map((q, idx) => (
                  <LeftBubble key={idx} sender={idx === 0 ? "Tind'eirb" : ''} message={q.replace(/{fillotName}/g, user.firstName)} senderId={TINDEIRB_ID} />
                )) : (
                  <LeftBubble sender="Tind'eirb" message={question.question.replace(/{fillotName}/g, user.firstName)} senderId={TINDEIRB_ID} />
                )
              ) : (
                <>
                  <LeftBubble sender="Tind'eirb" message={question.question} senderId={TINDEIRB_ID} />
                  <div className="w-full flex flex-wrap gap-2 justify-around p-4">
                    {question.option && question.option.map((opt: string, idx: number) => (
                      <button
                        key={idx}
                        className='btn bg-rose-500 text-white rounded-full px-4 py-2'
                        style={{
                          maxWidth: '80vw',
                          wordWrap: 'break-word',
                          whiteSpace: 'normal',
                          minHeight: '40px',
                          height: 'auto',
                          lineHeight: '1.5',
                        }}
                        onClick={() => handleSendMessage(opt)}
                        disabled={responses[index] !== undefined}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <RightBubble
                sender={user.firstName}
                message={response}
                senderId={user.id}
                onEdit={(newMessage) => handleEditMessage(index, newMessage)}
                canEdit={true}
              />
            </React.Fragment>
          );
        })}
        {currentQuestion && (
          <>
            {currentQuestion.type === 'text' ? (
              Array.isArray(currentQuestion.question) ? currentQuestion.question.map((q, idx) => (
                <LeftBubble key={idx} sender={idx === 0 ? "Tind'eirb" : ''} message={q.replace(/{fillotName}/g, user.firstName)} senderId={TINDEIRB_ID} />
              )) : (
                <LeftBubble sender="Tind'eirb" message={currentQuestion.question.replace(/{fillotName}/g, user.firstName)} senderId={TINDEIRB_ID} />
              )
            ) : (
              <>
                <LeftBubble sender="Tind'eirb" message={currentQuestion.question} senderId={TINDEIRB_ID} />
                <div className="w-full flex flex-wrap gap-2 justify-around p-4">
                  {currentQuestion.option && currentQuestion.option.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      className='btn bg-rose-500 text-white rounded-full px-4 py-2'
                      style={{
                        maxWidth: '80vw',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        minHeight: '40px',
                        height: 'auto',
                        lineHeight: '1.5',
                      }}
                      onClick={() => handleSendMessage(opt)}
                      disabled={responses[currentQuestionIndex] !== undefined}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </>
    );
  };

  /*
    Scroll to the bottom when user responses update.
  */
  useEffect(() => {
    scrollToBottom();
  }, [user.infos?.res]);

  /*
    Render a loading state if the user data is not available.
  */
  if (!user) {
    return <div>Loading...</div>;
  }

  // Main UI for the FillotView component
  const responses = user.infos?.res || [];

  return (
    <div className='w-full h-full gradient dark:bg-gray-950'>
      <div className='bg w-full h-full flex items-center'>
        <div className='flex flex-col h-screen w-full z-10'>
          <div className='w-full min-h-16 h-fit md:h-16 bg-white/80 backdrop-blur-md dark:bg-gray-900 relative z-10 shadow-sm flex flex-col md:flex-row items-center md:justify-between p-5'>
            <h1 className='text-rose-500 font-semibold text-2xl tracking-tight md:block hidden'>
              Tind'eirb
            </h1>
            <div className='flex flex-col md:flex-row items-center justify-center md:justify-center gap-4 md:gap-4'>
              <div className='w-10 h-10'>
                <Avatar seed={user.id} />
              </div>
              <div className='text-center md:text-left'>
                <h1>{user.firstName} {user.lastName}</h1>
                <h1 className='font-light text-sm text-gray-500 dark:text-gray-200 -mt-1'>
                  {user.parrain === '' ? "Toujours à la recherche d'un parrain ou d'une marraine ..." : "Tu as été adopté par quelqu'un !"}
                </h1>
              </div>
            </div>
            <button className='btn mt-4 md:mt-0 rounded-full dark:bg-white dark:text-gray-900 dark:hover:bg-rose-500 dark:hover:text-white w-full md:w-auto' onClick={() => logout()}>
              Se déconnecter
            </button>
          </div>

          <div ref={conversationRef} className="w-full md:w-3/5 mx-auto pt-8 h-full overflow-y-scroll shadow-xl shadow-inner md:shadow-left md:shadow-right p-4">
            {user.infos && user.infos.sex ? (
              <>
                <p className='text-gray-800 dark:text-gray-200 text-center w-full'>
                  Début de votre discussion avec Tind'eirb
                </p>
                {renderConversation()}
                {user.infos.res && user.infos.res.length >= form.length && (
                  <>
                    <LeftBubble
                      sender="Tind'eirb"
                      message="Merci d'avoir répondu à toutes les questions !"
                      senderId={TINDEIRB_ID}
                    />
                    <LeftBubble
                      sender="Tind'eirb"
                      message="Tes réponses ont été enregistrées, prépare toi aux prochaines semaines !!!"
                      senderId={TINDEIRB_ID}
                    />
                  </>
                )}
              </>
            ) : (
              renderGenderSelection()
            )}
          </div>

          {user.infos && user.infos.sex && (!user.infos.res || (user.infos.res && user.infos.res.length < form.length)) && (
            <div className="w-full md:w-3/5 mx-auto p-4 bg-gray-100 dark:bg-gray-800 flex items-center gap-4">
              <input
                type="text"
                className={`flex-1 p-2 rounded-md dark:bg-gray-900 dark:text-white ${inputError ? 'border-2 border-red-500' : ''}`}
                value={message}
                onChange={handleInputChange}
                placeholder="Tapez votre réponse..."
                onKeyDown={handleKeyDown}
                disabled={form[responses.length]?.type === 'qcm'}
              />
              <button
                className="btn bg-rose-500 text-white rounded-full px-4 py-2"
                onClick={() => handleSendMessage()}
                disabled={form[responses.length]?.type === 'qcm'}
              >
                Envoyer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FillotView;