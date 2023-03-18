import { j as json } from "../../../../chunks/index.js";
const POST = async (event) => {
  const data = await event.request.formData();
  const username = data.get("username");
  const email = data.get("email");
  console.log(username, email);
  return json({
    success: true
  });
};
export {
  POST
};
