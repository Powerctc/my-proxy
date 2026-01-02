# Node.js version ကို သတ်မှတ်မယ်
FROM node:18-slim

# Working directory ဆောက်မယ်
WORKDIR /app

# package.json ကို အရင်ကူးမယ်
COPY package*.json ./

# Dependency တွေ install လုပ်မယ်
RUN npm install

# ကျန်တဲ့ code တွေအကုန်ကူးမယ်
COPY . .

# Port ကို ဖွင့်ပေးမယ် (Koyeb ရဲ့ default port က 8080 ပါ)
EXPOSE 8080

# App ကို run မယ်
CMD ["node", "index.js"]
