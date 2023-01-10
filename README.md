# Svelte Branch
this branch is rebuilding the web using Svelte framework </br>

### Why this branch created?
- i m not familiar with php yet
- i m not familiar with scss yet
- more organized project
- easier to develope test with hot module reload
- lesser boilerplate

### Whats the difference?
- you can cram Html,Css,Javascript code on .svelte file
- its support typescript to prevent javascript undefined behavior
- its support scss so just import it directly without compiling to css
- add github action for automatic test
- i made the structure to be as same as the php structure
- both en and jp page is fused, but will be simpler and easier than separated
- using localstorage instead of cookies for longer user storage

## Project Structure
The project will look like this ignoring boilerplate file
```
|-frontend        (main directory)
| |-dist          (output file (gitignored))
| |-public        (public static folder)
| | |-img     
| | |-sass
| |-src
| | |-lang        (for main translation file)
| | |-lib         (reusable component stored here)
| | |-App.svelte  (main index.html file)
| |-package.json  (to record all node.js dependency)
```
## Whats needed

- Node : v16 or up (mine v19)
- Pnpm : v7

### How to install node.js and pnpm?
For node you can install it from their web or using nvm on linux </br>
For pnpm you only can install it after node.js installed then run this on terminal</br>
```shell
npm i -g pnpm
```
## How to Develop or test?
run this on main folder to run web on dev server
```shell
cd frontend
pnpm i
pnpm dev
```
## How to deploy web?
this easily done by
```shell
cd frontend
pnpm build
pnpm start
```
