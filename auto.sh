if [ -z $1 ] && [ -z $2 ] && [ -z $3 ] && [ -z $4 ] && [ -z $5 ]
then
  echo "missing wparameters, process will aborted"
  exit
fi

if [ -d "$2" ]
then
   echo "$2 does exist."
   exit
fi

username="luisperotto"
password="cc123123123"

BRANCH_NAME="$1"
FOLDER_NAME="$2"
PROXY="$3"
MERCHANT_ID="$4"
BANK_NAME="$5"

GIT_URL="https://${username}:${password}@gitlab.com/payxyz/union-bank-scraper"

GIT=$(where git | head -n 1)

"${GIT}" clone -b ${BRANCH_NAME} ${GIT_URL} ${FOLDER_NAME}
wait

file="${FOLDER_NAME}/.env"
echo "APPLICATION_NAME=${BANK_NAME}" > $file
echo "HEADLESS_MODE=true" >> $file
echo "SERVER_PORT=3000" >> $file
echo "AUTH_TOKEN=\$2y\$10\$/8kfmsUd2dmEp32VgZp5guenBpwhQNC7R1VElQIa3voIt7VOyXQQO" >> $file
echo "BANK_SCRAPER_API=http://127.0.0.1:5998" >> $file
echo "PROXY=${PROXY}" >> $file
echo "DATABASE_URL='mysql://paybo_admin:mixieboo7oZi9Ohphah7eisuf@db-paybo-commspay.cnkdowhi9hub.ap-south-1.rds.amazonaws.com:3306/paybo'" >> $file
echo "MERCHANT_ID=${MERCHANT_ID}" >> $file
cat $file