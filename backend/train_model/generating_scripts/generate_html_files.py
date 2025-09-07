import os
import random
from faker import Faker


# Folder to store generated HTML files
OUTPUT_DIR = "html_pages"

# HTML template
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

def generate_random_profile(fake: Faker, img_id: int):
    name = fake.name()
    title = fake.job()
    emails = [fake.email()]
    phones = [fake.phone_number()]
    location = f"{fake.city()}, {fake.country()}"
    image = f"https://i.pravatar.cc/200?img={img_id}"  # random avatar
    description = (
        f"{name} is a {title} based in {location}. "
        f"You can contact them at {emails[0]} or {phones[0]}. "
        f"They are passionate about {fake.word()} and {fake.word()}."
    )
    return {
        "name": name,
        "title": title,
        "email": emails,
        "phone": phones,
        "location": location,
        "image": image,
        "description": description
    }

def generate_html_files(num_files: int, output_dir=OUTPUT_DIR):
    os.makedirs(output_dir, exist_ok=True)
    fake = Faker()

    for i in range(1, num_files + 1):
        profile = generate_random_profile(fake, img_id=i)
        html_content = HTML_TEMPLATE.format(
            name=profile["name"],
            title=profile["title"],
            emails=", ".join(profile["email"]),
            phones=", ".join(profile["phone"]),
            location=profile["location"],
            image=profile["image"],
            description=profile["description"]
        )

        file_path = os.path.join(output_dir, f"profile_{i}.html")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"Generated: {file_path}")

if __name__ == "__main__":
    NUM_FILES = 100   # <-- set how many HTML files you want
    generate_html_files(NUM_FILES)
