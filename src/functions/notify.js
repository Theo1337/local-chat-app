const notifyUser = (c) => {
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
};

export default notifyUser
