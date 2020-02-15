## Instructions to run the project:

1) Have Node.js installed in the machine
2) In the root, run: npm install
3) In the client folder, run: npm install
4) In the server folder, run: npm install
5) Download python 3.7+ if you don't have it; in the file server/routes/index.js in line 29 replace pythonPath with your local path to the python installation, this is a server side procedure so it needs to be done manually.
6) Also, if you don't have it, install pip for python, you can follow the instructions on https://www.liquidweb.com/kb/install-pip-windows/, you'll need this to install python depedencies.
7) In the directory server/public on the cmd run: python/py -m pip install -r requirements.txt to install all required python dependencies. After installing you can test your installation by running python ./clustering.py on the directory, it should output "Dependencies installed!"; if it complains about a specific depedency you should manually install it by running python -m pip install <depedency>.
8) In the root, run: npm start root

Go to localhost:3000 for client web page
Go to localhost:3001 for server (Express)

## Research Paper
### Video Game Interactive Network Visualization
https://drive.google.com/file/d/1f21wPZVTI5Sk64y_YdQBDPg9_kjALDlW/view?usp=sharing
