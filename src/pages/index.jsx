import { useState, useEffect, useRef } from "react";

import Head from "next/head";
import Image from "next/image";

import moment from "moment";

import { IoIosClose, IoIosArrowDown, IoIosTrash } from "react-icons/io";
import { MdEmojiEmotions, MdOutlineModeEdit } from "react-icons/md";
import { BsReply } from "react-icons/bs";
import { LuSettings } from "react-icons/lu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import socket from "@/lib/socket";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [notified, setNotified] = useState({
    value: false,
    focused: false,
  });
  const [configs, setConfigs] = useState({
    value: "",
    reply: null,
    type: "message",
    image: "",
    lastMessage: null,
    user: {
      name: "",
      id: "",
      color: 0,
    },
  });
  const [settings, setSettings] = useState({
    name: "",
    color: 0,
    saved: false,
  });

  const [userTyping, setUserTyping] = useState([]);

  const [textColors, setTextColors] = useState([
    {
      primary: "bg-pink-300",
      secondary: "bg-pink-200",
      selected: false,
    },
    {
      primary: "bg-green-300",
      secondary: "bg-green-200",
      selected: false,
    },
    {
      primary: "bg-yellow-300",
      secondary: "bg-yellow-200",
      selected: false,
    },
    {
      primary: "bg-purple-300",
      secondary: "bg-purple-200",
      selected: false,
    },
    {
      primary: "bg-red-300",
      secondary: "bg-red-200",
      selected: false,
    },
    {
      primary: "bg-sky-300",
      secondary: "bg-sky-200",
      selected: false,
    },
    {
      primary: "bg-orange-300",
      secondary: "bg-orange-200",
      selected: false,
    },
    {
      primary: "bg-white",
      secondary: "bg-neutral-100",
      selected: true,
    },
  ]);

  const lastMessageRef = useRef(null);

  const notifyUser = (c) => {
    if (navigator.userAgent.includes("windows")) {
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      } else if (Notification.permission === "granted") {
        console.log("Sending notification");

        new Notification(`${c.user.name} mandou uma mensagem!`, {
          body: c.value,
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Sending notification");

            new Notification(`${c.user.name} mandou uma mensagem!`, {
              body: c.value,
            });
          }
        });
      }
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("c-text.user");
    const serializedUser = JSON.parse(user);

    if (
      serializedUser === "undefined" ||
      serializedUser === null ||
      !serializedUser
    ) {
      return (window.location.href = "/login");
    } else {
      setConfigs({
        ...configs,
        user: serializedUser,
      });

      setSettings({
        ...settings,
        name: serializedUser.name,
      });

      textColors[serializedUser?.color].selected = true;
    }

    socket.emit("getMessages");
  }, []);

  useEffect(() => {
    socket.on("userTypingId", (e) => {
      setUserTyping(e);

      setTimeout(() => {
        scrollToLast();
      }, 0);
    });
  }, [socket, configs.user]);

  const notifyMessage = () => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      if (
        lastMessage?.user.id != configs.user.id &&
        notified.value == false &&
        notified.focused == false
      ) {
        setNotified(true);

        setTimeout(() => {
          setNotified(false);
        }, 0.25 * 1000 * 60);

        notifyUser(lastMessage);
      }
    }
  };

  useEffect(() => {
    socket.on("messages", (e) => {
      setMessages(e.value);
    });
  }, [socket]);

  // useEffect(() => {
  //   window.addEventListener("focus", (e) => {
  //     setConfigs({
  //       ...configs,
  //       unread: 0,
  //     });
  //   });
  // }, []);

  const scrollToLast = () => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToLast();

    notifyMessage();
  }, [messages]);

  useEffect(() => {
    window.addEventListener("focus", () => {
      setNotified({
        ...notified,
        focused: true,
      });
    });

    window.addEventListener("blur", () => {
      setNotified({
        ...notified,
        focused: false,
      });
    });
  }, []);

  // useEffect(() => {
  //   console.log(notified);
  // }, [notified]);

  const allStickers = require.context("/public/stickers/", true);
  const stickers = allStickers.keys().map((image) => allStickers(image));

  return (
    <div
      className={`p-2 px-4 w-full h-screen flex flex-col gap-2.5 flex-center justify-between`}
    >
      <Head>
        <title>Chat</title>
      </Head>
      <div
        className={`transition relative bg-neutral-200 shadow-md py-2 rounded-lg px-2 h-full overflow-auto`}

        // : configs.reply
        //     ? configs.reply.type === "sticker"
        //       ? "max-h-[76.25%]"
        //       : "max-h-[79.25%]"
        //     : configs.value.length > 153
        //     ? "max-h-[89%]"
        //     : "max-h-[93%]"
      >
        <div className="pb-2 mt-2">
          {messages?.map((each, i) =>
            each.user.id === configs.user.id ? (
              <div
                onDoubleClick={() => {
                  if (configs.type == "edit" || each.type == "deleted") return;

                  setConfigs({
                    ...configs,
                    reply: each,
                  });
                  setTimeout(() => {
                    scrollToLast();
                  }, 0);

                  document.getElementById("input").focus();
                }}
                key={i}
                className="flex flex-col group relative items-end hover:bg-gray-500/5 p-0.5 rounded-lg transition cursor-pointer"
              >
                {each.type !== "deleted" && (
                  <div className="absolute top-0 right-4 ">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={`opacity-0 outline-none p-0.5 absolute shadow-md rounded-full hover:brightness-110 transition z-10 group-hover:opacity-100 ${
                          textColors[configs.user.color].primary
                        }`}
                      >
                        <IoIosArrowDown className="text-sm" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="mr-6">
                        {each.type !== "sticker" && (
                          <DropdownMenuItem
                            onClick={() => {
                              const lastMessage = each;

                              if (
                                lastMessage.type == "sticker" ||
                                configs.reply
                              )
                                return;

                              setConfigs({
                                ...configs,
                                value: lastMessage.value,
                                reply: lastMessage.reply,
                                lastMessage: lastMessage,
                                type: "edit",
                              });
                            }}
                          >
                            <MdOutlineModeEdit />
                            Editar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            if (configs.type == "edit") return;

                            setConfigs({
                              ...configs,
                              reply: each,
                            });
                            setTimeout(() => {
                              scrollToLast();
                            }, 0);

                            document.getElementById("input").focus();
                          }}
                        >
                          <BsReply />
                          Responder
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            socket.emit("deleteMessage", { id: each.id });
                          }}
                          className="text-red-500"
                        >
                          <IoIosTrash />
                          Apagar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                <div
                  className={`rounded messageBox relative transition max-w-[45%] min-w-[75px] flex flex-col ${
                    each.type === "sticker"
                      ? ""
                      : textColors[configs.user.color].primary
                  } p-1 px-3 m-0.5`}
                >
                  {each.reply && each.type !== "deleted" && (
                    <div
                      className={`border-0 border-solid border-s-4 border-red-500 ${
                        textColors[configs.user.color].secondary
                      } p-2 rounded my-2 w-full relative`}
                    >
                      <div className="text-sm font-bold underline py-0.5 text-red-600">
                        {each.reply.user.name}
                      </div>

                      {each.reply.type === "sticker" && (
                        <div className="">
                          <Image
                            unoptimized
                            src={each.reply.value}
                            alt={each.reply.value}
                            width={50}
                            height={50}
                          />
                        </div>
                      )}

                      {each.reply.type === "image" && (
                        <div className="">
                          <Image
                            unoptimized
                            src={each.reply.imageURL}
                            alt={each.reply.value}
                            width={50}
                            height={50}
                          />
                        </div>
                      )}

                      {each.reply.type === "message" && (
                        <div className="max-w-[84%] max-h-[150px] truncate break-words">
                          {each.reply.value}
                        </div>
                      )}
                    </div>
                  )}
                  {each.type === "sticker" && (
                    <div>
                      <Image
                        unoptimized
                        src={each.value}
                        alt={each.value}
                        height={125}
                        width={125}
                      />

                      <div
                        className={`text-xs text-neutral-500 float-right ${
                          textColors[configs.user.color].primary
                        } rounded-lg p-1 mt-1 -mr-3`}
                      >
                        {each.time}
                      </div>
                    </div>
                  )}
                  {each.type === "message" && (
                    <div className="flex flex-col items-end w-full justify-between gap-2">
                      <div className={`max-w-[100%] break-words`}>
                        {each.value}
                      </div>
                      <div className="text-xs text-neutral-600 flex gap-0.5">
                        {each.edited && (
                          <div className="italic text-neutral-500 text-[11px]">
                            Editada
                          </div>
                        )}
                        {each.time}
                      </div>
                    </div>
                  )}
                  {each.type === "deleted" && (
                    <div className="text-neutral-500">{each.value}</div>
                  )}

                  {each.type === "image" && (
                    <div>
                      <img className="rounded-lg mb-2" src={each.imageURL} />
                      <div className="flex flex-col items-end w-full justify-between gap-2">
                        <div className={`max-w-[100%] break-words`}>
                          {each.value}
                        </div>
                        <div className="text-xs text-neutral-600 flex gap-0.5">
                          {each.edited && (
                            <div className="italic text-neutral-500 text-[11px]">
                              Editada
                            </div>
                          )}
                          {each.time}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                onDoubleClick={() => {
                  if (configs.type == "edit" || each.type == "deleted") return;

                  setConfigs({
                    ...configs,
                    reply: each,
                  });
                  setTimeout(() => {
                    scrollToLast();
                  }, 0);

                  document.getElementById("input").focus();
                }}
                key={i}
                className="flex flex-col group relative items-start hover:bg-gray-500/5 p-0.5 rounded-lg transition cursor-pointer"
              >
                <div className="absolute top-0 left-0 ">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={`opacity-0 outline-none p-0.5 absolute shadow-md rounded-full hover:brightness-110 transition z-10 group-hover:opacity-100 ${
                        textColors[each.user.color].primary
                      }`}
                    >
                      <IoIosArrowDown className="text-sm" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="ml-6">
                      <DropdownMenuItem
                        onClick={() => {
                          if (configs.type == "edit") return;

                          setConfigs({
                            ...configs,
                            reply: each,
                          });
                          setTimeout(() => {
                            scrollToLast();
                          }, 0);

                          document.getElementById("input").focus();
                        }}
                      >
                        <BsReply />
                        Responder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div
                  className={`rounded messageBox max-w-[45%] min-w-[75px] flex flex-col ${
                    each.type === "sticker"
                      ? ""
                      : textColors[each.user.color].primary
                  } p-1 px-3 m-0.5`}
                >
                  {each.reply && each.type !== "deleted" && (
                    <div
                      className={`border-0 border-solid border-s-4 border-red-500 ${
                        textColors[each.user.color].secondary
                      } p-2 rounded my-2 w-full relative`}
                    >
                      <div className="text-sm font-bold underline py-0.5 text-red-600">
                        {each.reply.user.name}
                      </div>

                      {each.reply.type === "sticker" && (
                        <div className="">
                          <Image
                            unoptimized
                            src={each.reply.value}
                            width={50}
                            height={50}
                            alt={each.reply.value}
                          />
                        </div>
                      )}
                      {each.reply.type === "image" && (
                        <div className="">
                          <Image
                            unoptimized
                            src={each.reply.imageURL}
                            alt={each.reply.value}
                            width={50}
                            height={50}
                          />
                        </div>
                      )}
                      {each.reply.type === "message" && (
                        <div className="max-w-full truncate">
                          {each.reply.value}
                        </div>
                      )}
                    </div>
                  )}
                  {each.type === "sticker" && (
                    <div>
                      <Image
                        unoptimized
                        src={each.value}
                        alt={each.value}
                        height={125}
                        width={125}
                      />

                      <div
                        className={`text-xs text-neutral-500 float-left ${
                          textColors[each.user.color].primary
                        } rounded-lg p-1 mt-1 -ml-3 px-1.5`}
                      >
                        {each.time}
                      </div>
                    </div>
                  )}
                  {each.type === "message" && (
                    <div className="flex flex-col justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold underline py-0.5 text-neutral-600">
                          {each.user.name}
                        </div>
                        <div className="max-w-[25ch] break-words">
                          {each.value}
                        </div>
                      </div>
                      <div className="text-xs text-neutral-600 flex gap-0.5 items-center justify-end pb-0.5">
                        {each.edited && (
                          <div className="italic text-neutral-500 text-[11px]">
                            Editada
                          </div>
                        )}
                        {each.time}
                      </div>
                    </div>
                  )}
                  {each.type === "deleted" && (
                    <div className="text-neutral-500">{each.value}</div>
                  )}

                  {each.type === "image" && (
                    <div>
                      <img className="rounded-lg my-2" src={each.imageURL} />
                      <div className="flex flex-col items-end w-full justify-between gap-2">
                        <div className={`max-w-[100%] break-words`}>
                          {each.value}
                        </div>
                        <div className="text-xs text-neutral-600 flex gap-0.5">
                          {each.edited && (
                            <div className="italic text-neutral-500 text-[11px]">
                              Editada
                            </div>
                          )}
                          {each.time}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
          <div ref={lastMessageRef} />
          {userTyping.length > 0 && (
            <div>
              {/* remove user with same id as client */}
              {userTyping.map((each, i) => (
                <div>
                  {each.id !== configs.user.id && (
                    <div
                      className={`${
                        textColors[each.color].primary
                      } w-min p-1 py-2 rounded`}
                      key={i}
                    >
                      <div className="loader"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* {!userTyping == "" && (
          <div className="text-xs font-bold absolute bottom-3 left-3">
            {userTyping} está digitando...
          </div>
        )} */}
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="bg-gray-300 w-full  rounded-lg transition p-2 flex flex-col">
          {configs.reply && configs.type !== "edit" && (
            <div className="border-0 text-sm border-solid border-s-4 border-red-500 bg-neutral-400 p-2 rounded mb-2 w-full relative">
              <div className="text-sm font-bold underline py-0.5 text-red-600">
                {configs.reply.user.name}
              </div>

              {configs.reply.type === "sticker" && (
                <div className="">
                  <Image
                    unoptimized
                    src={configs.reply.value}
                    alt={configs.reply.value}
                    width={35}
                    height={35}
                  />
                </div>
              )}
              {configs.reply.type === "image" && (
                <div className="">
                  <Image
                    unoptimized
                    src={configs.reply.imageURL}
                    alt={configs.reply.value}
                    width={35}
                    height={35}
                  />
                  <div>{configs.reply.value}</div>
                </div>
              )}
              {configs.reply.type === "message" && (
                <div className="max-w-screen truncate">
                  {configs.reply.value}
                </div>
              )}
              <div
                onClick={() => {
                  setConfigs({ ...configs, reply: null });
                }}
                className="absolute top-1 right-1 hover:bg-white/40 rounded-full transition text-xs cursor-pointer"
              >
                <IoIosClose className="text-xl" />
              </div>
            </div>
          )}
          {configs.type === "edit" && (
            <div className="border-0 text-sm border-solid border-s-4 border-red-500 bg-neutral-400 p-2 rounded mb-2 w-full relative">
              <div className="flex items-center gap-1">
                <div className="font-bold italic text-neutral-700">
                  Editando:
                </div>
                <div className="max-w-[80%] truncate">
                  {configs.lastMessage.value}
                </div>
              </div>
              <div
                onClick={() => {
                  setConfigs({ ...configs, type: "message", value: "" });
                }}
                className="absolute top-1 right-1 hover:bg-white/40 rounded-full transition text-xs cursor-pointer"
              >
                <IoIosClose className="text-xl" />
              </div>
            </div>
          )}
          {configs.type === "image" && (
            <div className="mb-2.5">
              <div className="flex items-center w-32 justify-start relative">
                <div
                  onClick={() => {
                    setConfigs({ ...configs, type: "message", image: "" });
                  }}
                  className="absolute text-white bg-red-500 -top-1 -right-1 hover:scale-105 rounded-full transition text-base cursor-pointer"
                >
                  <IoIosClose className="text-xl" />
                </div>
                <img className="w-32 h-32 object-cover" src={configs.image} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <textarea
              className={`resize-none bg-inherit h-[25px] max-h-fit w-full outline-none px-2 text-wrap`}
              placeholder="Digite aqui..."
              value={configs.value}
              autoComplete="off"
              id="input"
              onChange={(e) => {
                setConfigs({
                  ...configs,
                  value: e.target.value,
                });

                if (e.target.value.length > 0) {
                  socket.emit("userTyping", {
                    user: { id: configs.user.id, color: configs.user.color },
                    type: "typing",
                  });
                } else if (e.target.value.length == 0) {
                  socket.emit("userTyping", {
                    user: { id: configs.user.id, color: configs.user.color },
                    type: "sending",
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key == "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (
                    configs.type !== "image" &&
                    (configs.value == "" || configs.value == null)
                  )
                    return;
                  const time = moment();
                  const message_id = Math.random().toString(16).slice(2);

                  const val = configs.value;
                  // const val =
                  //   configs.value.substring(0, configs.value.length) +
                  //   "\n" +
                  //   configs.value.substring(configs.value.length + "\n");

                  if (configs.type === "edit") {
                    socket.emit("editMessage", {
                      id: configs.lastMessage.id,
                      value: val,
                      reply: configs.reply ? configs.reply : false,
                      user: configs.user,
                      time: configs.lastMessage.time,
                      type: "message",
                      edited: true,
                    });
                  }

                  if (configs.type === "message") {
                    socket.emit("newMessage", {
                      id: message_id,
                      value: val,
                      reply: configs.reply ? configs.reply : false,
                      user: configs.user,
                      time: time.format("HH:mm"),
                      type: "message",
                    });
                  }

                  if (configs.type === "image") {
                    socket.emit("newMessage", {
                      id: message_id,
                      value: configs.value,
                      imageURL: configs.image,
                      reply: configs.reply ? configs.reply : false,
                      user: configs.user,
                      time: time.format("HH:mm"),
                      type: "image",
                    });
                  }

                  setConfigs({
                    ...configs,
                    value: "",
                    type: "message",
                    reply: null,
                    lastMessageId: message_id,
                  });

                  socket.emit("userTyping", {
                    user: { id: configs.user.id, color: configs.user.color },
                    type: "sending",
                  });
                }
                if (e.key == "ArrowDown") {
                  const userLastMessage = messages.filter((each) => {
                    return each.user.id === configs.user.id;
                  });
                  const lastMessage =
                    userLastMessage[userLastMessage.length - 1];

                  if (lastMessage.type == "sticker" || configs.reply) return;

                  setConfigs({
                    ...configs,
                    value: lastMessage.value,
                    reply: lastMessage.reply,
                    lastMessage: lastMessage,
                    type: "edit",
                  });
                }
              }}
              onPaste={(e) => {
                if (e.clipboardData && e.clipboardData.items) {
                  const items = e.clipboardData.items;

                  for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                      const blob = items[i].getAsFile();

                      const source = window.webkitURL.createObjectURL(blob);

                      setConfigs({
                        ...configs,
                        type: "image",
                        image: source,
                      });
                    }
                  }
                }
              }}
            />

            {/* Emoji menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="rounded-full hover:bg-gray-500/30 cursor-pointer transition p-1">
                  <MdEmojiEmotions className="text-xl text-gray-700" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="mr-6">
                <div className="grid place-items-center grid-cols-8 gap-2 ">
                  {stickers.map((each, i) => (
                    <div
                      onClick={() => {
                        const time = moment();
                        setConfigs({ ...configs, reply: null });
                        socket.emit("newMessage", {
                          value: each.default,
                          reply: configs.reply ? configs.reply : false,
                          user: configs.user,
                          time: time.format("HH:mm"),
                          type: "sticker",
                        });
                      }}
                      className="w-[75px] h-[75px] flex items-center justify-center"
                      key={i}
                    >
                      <DropdownMenuItem>
                        <Image
                          width={75}
                          height={75}
                          src={each.default}
                          unoptimized
                          draggable={false}
                          alt={`img-${i}`}
                          className="object-cover w-full h-full rounded-lg p-2  cursor-pointer transition"
                        />
                      </DropdownMenuItem>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="rounded-full hover:bg-gray-500/30 cursor-pointer transition p-1">
                  <LuSettings className="text-xl text-gray-700" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="mr-6 p-4">
                <div className="font-bold text-xs font-[Poppins]">Nome</div>
                <Input
                  value={settings.name}
                  placeholder="Nome"
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      name: e.target.value,
                    });
                  }}
                />
                <DropdownMenuSeparator className="bg-gray-300 my-2" />
                <div className="flex items-start flex-col">
                  <div className="font-bold text-xs font-[Poppins]">Cores</div>
                  <div className="grid grid-flow-col grid-rows-2 w-full gap-3 place-items-center p-1">
                    {textColors.map((each, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          textColors.forEach((e) => {
                            e.selected = false;
                          });
                          textColors[i].selected = true;
                          setSettings({
                            ...settings,
                            color: i,
                          });
                        }}
                        className={`${each.primary} shadow-md w-5 h-5 rounded cursor-pointer aria-selected:outline-2 aria-selected:outline aria-selected:outline-blue-300 aria-selected:outline-offset-2`}
                        aria-selected={each.selected}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="my-2 mt-3 flex items-end justify-end">
                  <Button
                    onClick={() => {
                      setConfigs({
                        ...configs,
                        user: {
                          ...configs.user,
                          name: settings.name,
                          color: settings.color,
                          timeToNotify: settings.timeToNotify,
                        },
                      });

                      setSettings({
                        ...settings,
                        saved: true,
                      });

                      setTimeout(() => {
                        setSettings({
                          ...settings,
                          saved: false,
                        });
                        localStorage.setItem(
                          "c-text.user",
                          JSON.stringify(configs.user)
                        );
                      }, 1500);
                    }}
                    className="font-[Poppins] uppercase text-xs p-1"
                    variant={settings.saved ? "success" : "default"}
                  >
                    {settings.saved ? "Salvo" : "Salvar"}
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
