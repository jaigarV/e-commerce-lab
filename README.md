# The real Swedish Amazon, called Elshoppen

An Internet e-commerce site project to learn about databases for a college course

To make it run, I think is enough with cloning the project on a new server, installing node (thorugh snaps?), installing MySQL and executing the database SQL scripts followed by the node.js server script.

The SQL populate_database script (database/SQL_scripts/ and use the one with the biggest version number) make use of some images that have to be stored in the server beforehand. The path has to be in the directory where MySQL is installed, in my case was "/var/lib/mysql-files/" but in can vary. Then you need to update the populate_database scripts and modify the paths if the image file name changes, its extension or any other aspect of the path.

I decided to use port 80 for the server as is simpler to test, which means that the node.js scripts needs root privileges, please use "sudo node server_\*.js",

**This is a student project, not production code, take it at your own risk as the code comes with no guarantees and for sure has many security risks and vulnerabilities.**
