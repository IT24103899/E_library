import requests

ideas = ['Mystery and thriller', 'Love and romance', 'Technology and the future']
url = 'https://python-a-9.onrender.com/api/mobile/recommend/idea'

print("Starting Full AI Audit...")
for idea in ideas:
    try:
        r = requests.post(url, json={'idea': idea}, timeout=10)
        data = r.json()
        print(f"\n[Search Test: '{idea}']")
        print(f"  Status: {r.status_code}")
        print(f"  Count:  {len(data)} books found")
        if len(data) > 0:
            first = data[0]
            print(f"  Top Match: {first.get('title')} by {first.get('author')}")
            print(f"  Image Link: {first.get('coverUrl')}")
        else:
            print("  ❌ No books found for this idea.")
    except Exception as e:
        print(f"  ❌ Error testing '{idea}': {e}")

print("\nAudit Complete.")
