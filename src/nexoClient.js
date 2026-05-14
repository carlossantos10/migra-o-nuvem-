window.global = window.global || window;

import nexo from "@tiendanube/nexo";

const instance = nexo.create({
  clientId: "31751",
  log: false,
});

export default instance;