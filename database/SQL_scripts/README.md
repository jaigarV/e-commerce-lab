## How to upload image to MySQL from a SQL script

In the SQL script, use for the value the function LOAD_FILE(path), where "path" is the absolute path of the file in the target database system.

Nevertheless, not all path in the target system seems to work, the only valid path that has been proven to work is the /var/lib/mysql-files/ directory. Tested conducted in the home directory were unsuccessful even changing the permissions of the image file, or the owner and group of the file to mysql, the image was not uploaded. 
