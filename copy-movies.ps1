$KEY = "$Env:USERPROFILE\.ssh\ghdeploykey"
$SERVERHOST = "ubuntu@vloz.website"
$REMOTE_DIR = "{0}:{1}" -f $SERVERHOST, "zamunda-scrapper/movies.json"

scp -i $KEY ./movies.json $REMOTE_DIR
ssh -i $KEY $SERVERHOST "cd zamunda-scrapper && make prod"