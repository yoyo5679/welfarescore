import requests

url = "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52005M.do"
try:
    response = requests.get(url, verify=False, timeout=10)
    print("Length:", len(response.text))
except Exception as e:
    print("Error:", e)
