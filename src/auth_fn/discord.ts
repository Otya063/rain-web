import { redirect } from "@sveltejs/kit";

export const discord_url = (env?:boolean) => `https://discord.com/oauth2/authorize?response_type=code&client_id=${process.env.DISCORD_CLIENT_KEY}&scope=identify&redirect_uri=${encodeURIComponent(env?process.env.DISCORD_CALLBACK_URL:`${document.location.host}/api/discord`)}&prompt=consent`


//use this function for client side redirect, eg. button click login
export function client_login(env?:boolean) {
  let link = document.createElement("a")
  link.href = discord_url(env)
  link.click()
}

//use this function for server side redirect, eg. on +Page.server.ts
export function server_login(env?:boolean){
  //i dont really know
  redirect(300,discord_url(env))
}


export interface DiscordToken{
  access_token: string
  expires_in: number
}

export interface DiscordData{
  user: {
        id: string
        username: string
        avatar: string
        discriminator: string
    }
}

//use this to get the token in auth url
//note: auth url is recomended to be only at api route (get the code from url param get request `api/endpoint?code=xxx`)
export async function get_token(code:string){
   const body = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_KEY,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.DISCORD_CALLBACK_URL
    })
    let res = await fetch("https://discord.com/api/v10/oauth2/token",{
      method:"post",
      body:body,
      headers:{'Content-Type': 'application/x-www-form-urlencoded'}
    })
  return res.ok?await res.json() as DiscordToken:null
}

//use this to get user info
export async function get_user_data(token:string){
  let res = await fetch("https://discord.com/api/oauth2/@me",{
    headers:{'Authorization' : `Bearer ${token}` }
  })
  return res.ok?await res.json() as DiscordData:null
}
