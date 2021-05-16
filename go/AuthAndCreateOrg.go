package main

import (
	"fmt"
	"bytes"
	"strings"
	"time"
	"strconv"
	b64 "encoding/base64"
	"encoding/json"
	"net/http"
	"net/url"
	"io/ioutil"
)

type UAAResponse struct {
	Access_token string `json:"access_token"`
}

func main() {

  apiKey := "<Put your IBM Cloud API Key here>"
	tokenUrl := "https://iam.cloud.ibm.com/cloudfoundry/login/us-south/oauth/token"
	bearerToken := ""

	//Step 1: Obtain a bearer token
	form := url.Values{}
	form.Add("grant_type", "password")
	form.Add("username", "apikey")
	form.Add("password", apiKey)
	req, err := http.NewRequest("POST", tokenUrl, strings.NewReader(form.Encode()))
	req.PostForm = form
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

  data := "cf:"
	sEnc := b64.StdEncoding.EncodeToString([]byte(data))
	basic_hdr := "basic "+sEnc
	req.Header.Set("authorization", basic_hdr)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
			panic(err)
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	var msg UAAResponse
	err = json.Unmarshal(body, &msg)

	bearerToken = "bearer " + msg.Access_token

  //create a unique org suffix
  suffix := strconv.FormatInt((time.Now().Unix() / 1000),10)
	newOrgName := "my-new-organization-" + suffix
  content := "{\"name\":\"" + newOrgName+ "\"}"
 	var jsonStr = []byte(content)

	//Step 2: Use the bearer token to create an org
	OrgURL := "https://mccp.us-south.cf.cloud.ibm.com/v2/organizations"
	req, err = http.NewRequest("POST", OrgURL, bytes.NewBuffer(jsonStr))
	req.Header.Set("Authorization", bearerToken)
	req.Header.Set("Content-Type", "application/json")

	client = &http.Client{}
	resp, err = client.Do(req)
	if err != nil {
			panic(err)
	}
	defer resp.Body.Close()

	fmt.Println("response Status:", resp.Status)
}
