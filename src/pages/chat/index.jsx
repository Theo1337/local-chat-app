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
function Home() {
  const [configs, setConfigs] = useState({
    value: "",
    reply: {
      type: "message",
      value: "Hello",
      id: "",
      user: {
        name: "",
        id: "",
        color: 0,
      },
    },
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

  const allStickers = require.context("/public/stickers/", true);
  const stickers = allStickers.keys().map((image) => allStickers(image));

  return (
    <div className="flex flex-col items-center justify-center p-2 gap-2 h-screen">
      <div className="w-full bg-neutral-200 rounded-lg p-2 h-full shadow-md"></div>
      <div className="flex items-center justify-between w-full">
        <div className="bg-gray-300 rounded-lg transition w-full p-2 flex flex-col">
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
              className={`${
                configs.value.length > 153 ? "" : "max-h-[25px]"
              } resize-none bg-inherit w-full outline-none px-2 text-wrap`}
              placeholder="Digite aqui..."
              value={configs.value}
              autoComplete="off"
              id="input"
              //   onFocus={() => {
              //     if (navigator.userAgent.includes("windows")) return;
              //     setInputFocus(true);
              //   }}
              //   onBlur={() => {
              //     if (navigator.userAgent.includes("windows")) return;

              //     setInputFocus(false);
              //   }}
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
                } else {
                  socket.emit("userTyping", {
                    user: { id: configs.user.id, color: configs.user.color },
                    type: "sending",
                  });
                }
              }}
              onKeyDown={(e) => {
                if (e.key == "Enter") {
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

                          console.log(settings);
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
}

export default Home;
