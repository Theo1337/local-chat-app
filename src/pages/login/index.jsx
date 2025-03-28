import { useState, useEffect } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Head from "next/head";

const LoginPage = () => {
  const [configs, setConfigs] = useState({
    name: "",
  });

  const handleSubmit = () => {
      localStorage.setItem(
        "c-text.user",
        JSON.stringify({
          name: configs.name,
          id: Math.random().toString(16).slice(2),
          color: 7,
        })
      );

      window.location.href = "/";
  };

  return (
    <div className="h-screen w-screen flex items-center bg-gray-300/60 justify-center">
      <Head>
        <title>Chat - Login</title>
      </Head>
      <div className="bg-white rounded-lg p-4 flex items-center justify-center flex-col gap-2">
        <div className="font-bold uppercase">Chat - Pai é brabo...</div>
        <Input
          placeholder="Nome"
          onChange={(e) => {
            setConfigs({ ...configs, name: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              handleSubmit();
            }
          }}
        />
        <Button onClick={handleSubmit} className="w-full uppercase">
          Login
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
