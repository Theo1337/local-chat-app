const notifyUser = (c) => {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    console.log("Sending notification");

    new Notification(
      `${c.user_name} is ${
        c.game_name === "Minecraft" ? "playing minecraft!" : "live!"
      }`,
      {
        icon: c.profile_image_url,
        body: c.title,
      }
    );
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Sending notification");

        new Notification(
          `${c.user_name} is ${
            c.game_name === "Minecraft" ? "playing minecraft!" : "live!"
          }`,
          {
            icon: c.profile_image_url,
            body: c.title,
          }
        );
      }
    });
  }
};

export default { notifyUser };
