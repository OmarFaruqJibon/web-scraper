import os
import random
from faker import Faker

# Faker with English but for Bangladesh
fake = Faker("en_US")

OUTPUT_DIR = "../html_pages"

HTML_TEMPLATE = """<html>
<head><title>Profile</title></head>
<body>
  <div class="intro-text">
    <p>{intro_text}</p>
  </div>

  <div class="profile-card">
    <h2>{name}</h2>
    <p>{title}</p>
    <p>Email: {emails}</p>
    <p>Phone: {phones}</p>
    <p>Location: {location}</p>
    <img src="{image}" alt="">
    <p>{description}</p>
  </div>

  <div class="footer-text">
    <p>{footer_text}</p>
  </div>
</body>
</html>
"""

# More realistic Bangladeshi first and last names
first_names = [
    "Abdul", "Md.", "Mahmud", "Sohel", "Rakibul", "Shafiqul", "Nazmul", "Ariful",
    "Sabbir", "Towhid", "Fahim", "Shihab", "Imran", "Jahid", "Parvez", "Farhana",
    "Rumana", "Sharmin", "Nusrat", "Sadia", "Samira", "Jannat", "Tahmina", "Mitu",
    "Sumaiya", "Mst. Rina", "Mst. Sathi", "Mst. Israt"
]

last_names = [
    "Hossain", "Rahman", "Ahmed", "Khan", "Islam", "Chowdhury", "Miah",
    "Siddique", "Uddin", "Akter", "Begum", "Biswas", "Talukder", "Sheikh"
]

# Some Bangladeshi cities
bd_cities = ["Dhaka", "Rajshahi", "Chattogram", "Khulna", "Sylhet", "Barisal", "Rangpur", "Mymensingh"]

intro_texts = [
    "Welcome to our Bangladeshi profile archive, showcasing individuals from different walks of life.",
    "Here we present profiles of people from Bangladesh, reflecting culture and diversity.",
    "This is a part of our dataset about Bangladesh, where you can explore lives of people from different cities.",
    "Get to know individuals from Bangladesh, their professions, and contributions to society."
]

footer_texts = [
    "Bangladesh is a land of rivers, culture, and resilience. Its people thrive in education, healthcare, and industry.",
    "The vibrant culture of Bangladesh is reflected through its people, living across Dhaka, Sylhet, and beyond.",
    "This dataset highlights the diversity of Bangladesh, from students to professionals, each playing a vital role.",
    "Bangladesh, with its rich history and warm people, continues to move forward in education, business, and innovation."
]

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

# Generate contextual description
def generate_description(name, title, location):
    title_lower = title.lower()
    if "teacher" in title_lower or "lecturer" in title_lower or "professor" in title_lower:
        return (
            f"{name} is a respected academic from {location}. They hold a postgraduate degree from a reputed Bangladeshi university "
            f"and have published research papers in local and international journals. {name} is involved in teaching undergraduate "
            f"and postgraduate students, guiding research, and contributing to the educational development of Bangladesh."
        )
    elif "student" in title_lower:
        subject = random.choice(["Computer Science", "Business Administration", "Medicine", "Engineering", "Law", "Economics"])
        return (
            f"{name} is currently a student in {location}, pursuing studies in {subject}. They are dedicated to academic excellence, "
            f"participating in cultural and sports activities, and aim to build a successful career in the future."
        )
    elif "doctor" in title_lower or "physician" in title_lower or "surgeon" in title_lower:
        specialization = random.choice(["Cardiology", "Medicine", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology"])
        return (
            f"Dr. {name} is a practicing doctor in {location}, specializing in {specialization}. With years of experience, "
            f"they serve patients in hospitals and clinics, contributing to the healthcare system of Bangladesh."
        )
    else:
        return (
            f"{name} is a Bangladeshi individual working as a {title}. They live in {location} and contribute to society through "
            f"their professional and personal activities."
        )

# Generate random profile
def generate_random_profile(img_id: int):
    name = generate_bd_name()
    title = "Surgeon"
    email = generate_bd_email(name)
    phone = generate_bd_phone()
    location = f"{random.choice(bd_cities)}, Bangladesh"
    image = f"https://i.pravatar.cc/200?img={img_id}"  # random avatar
    description = generate_description(name, title, location)
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
    num =251
    for i in range(1, num_files + 1):
        
        profile = generate_random_profile(img_id=i)
        html_content = HTML_TEMPLATE.format(
            intro_text=random.choice(intro_texts),
            name=profile["name"],
            title=profile["title"],
            emails=", ".join(profile["email"]),
            phones=", ".join(profile["phone"]),
            location=profile["location"],
            image=profile["image"],
            description=profile["description"],
            footer_text=random.choice(footer_texts)
        )

        file_path = os.path.join(output_dir, f"profile_bd_{num}.html")
        num+=1
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"Generated: {file_path}")
        

if __name__ == "__main__":
    NUM_FILES = 50
    generate_html_files(NUM_FILES)
