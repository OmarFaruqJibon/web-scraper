import os
import random
from faker import Faker

# Faker with English but for Bangladesh
fake = Faker("en_US")

OUTPUT_DIR = "html_pages_bd"

HTML_TEMPLATE = """<html>
<head><title>Profile</title></head>
<body>
  <div class="profile-card">
    <h2>{name}</h2>
    <p>{title}</p>
    <p>Email: {emails}</p>
    <p>Phone: {phones}</p>
    <p>Location: {location}</p>
    <img src="{image}" alt="">
    <p>{description}</p>
  </div>
</body>
</html>
"""

# Some common Bangladeshi first and last names
first_names = ["Rahim", "Karim", "Hasan", "Rakib", "Shakil", "Nazmul", "Arif", "Sumon", "Faruk", "Jamal",
               "Fatema", "Razia", "Nusrat", "Sharmin", "Mitu", "Salma", "Rima", "Mou", "Tania", "Shila", "Md Aziz", "MD Basir", "Md Rakib", "Mst Israt", "Mst Sathi"]
last_names = ["Hossain", "Ahmed", "Khan", "Islam", "Chowdhury", "Rahman", "Miah", "Siddique", "Uddin", "Akter"]

# Some Bangladeshi cities
bd_cities = ["Dhaka", "Rajshahi", "Chattogram", "Khulna", "Sylhet", "Barisal", "Rangpur", "Mymensingh"]

# Generate Bangladeshi phone
def generate_bd_phone():
    operator_codes = ["013", "014", "015", "016", "017", "018", "019"]
    code = random.choice(operator_codes)
    number = "".join([str(random.randint(0, 9)) for _ in range(8)])
    return f"+88{code}{number}"

# Generate Bangladeshi name
def generate_bd_name():
    return f"{random.choice(first_names)} {random.choice(last_names)}"

# Generate Bangladeshi email
def generate_bd_email(name):
    domain = random.choice(["gmail.com", "edu.bd", "mailbd.net", "bdmail.com", "ac.bd"])
    username = name.lower().replace(" ", ".")
    return f"{username}@{domain}"

# Generate random profile
def generate_random_profile(img_id: int):
    name = generate_bd_name()
    title = fake.job()
    email = generate_bd_email(name)
    phone = generate_bd_phone()
    location = f"{random.choice(bd_cities)}, Bangladesh"
    image = f"https://i.pravatar.cc/200?img={img_id}"  # random avatar
    description = f"{name} is a Bangladeshi person working as a {title}. They live in {location}."
    return {
        "name": name,
        "title": title,
        "email": [email],
        "phone": [phone],
        "location": location,
        "image": image,
        "description": description
    }

def generate_html_files(num_files: int, output_dir=OUTPUT_DIR):
    os.makedirs(output_dir, exist_ok=True)

    for i in range(1, num_files + 1):
        profile = generate_random_profile(img_id=i)
        html_content = HTML_TEMPLATE.format(
            name=profile["name"],
            title=profile["title"],
            emails=", ".join(profile["email"]),
            phones=", ".join(profile["phone"]),
            location=profile["location"],
            image=profile["image"],
            description=profile["description"]
        )

        file_path = os.path.join(output_dir, f"profile_bd_{i}.html")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"Generated: {file_path}")

if __name__ == "__main__":
    NUM_FILES = 300   # Set how many profiles you want
    generate_html_files(NUM_FILES)
