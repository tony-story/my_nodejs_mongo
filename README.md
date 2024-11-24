curl -X POST http://baidu.com:8081/db/test/coll -H "Content-Type: application/json" -d "{\"title\":\"t1\", \"name\":\"n1\",\"age\": 13,\"desc\":\"hello world\"}"


curl -X GET "http://localhost:8081/db/test/coll/view/?title=t1"

curl -X GET "http://localhost:8081/db/test/coll/view?key=title&value=t1&type=S"
