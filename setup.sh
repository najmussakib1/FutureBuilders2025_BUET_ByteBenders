#!/bin/bash

echo "🏥 Rural Healthcare AI - Setup Script"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure it:"
    echo "  cp .env.example .env"
    exit 1
fi

# Check for Groq API key
if grep -q "your-groq-api-key-here" .env; then
    echo "⚠️  Please add your Groq API key to .env file"
    echo "   Get your key from: https://console.groq.com/keys"
    echo ""
    read -p "Enter your Groq API key: " GROQ_KEY
    if [ -n "$GROQ_KEY" ]; then
        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/GROQ_API_KEY=\"your-groq-api-key-here\"/GROQ_API_KEY=\"$GROQ_KEY\"/" .env
        else
            sed -i "s/GROQ_API_KEY=\"your-groq-api-key-here\"/GROQ_API_KEY=\"$GROQ_KEY\"/" .env
        fi
        echo "✅ Groq API key updated"
    fi
fi

# Generate NextAuth secret if needed
if grep -q "your-nextauth-secret-key-change-this-in-production" .env; then
    echo "🔐 Generating NextAuth secret..."
    SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/NEXTAUTH_SECRET=\"your-nextauth-secret-key-change-this-in-production\"/NEXTAUTH_SECRET=\"$SECRET\"/" .env
    else
        sed -i "s/NEXTAUTH_SECRET=\"your-nextauth-secret-key-change-this-in-production\"/NEXTAUTH_SECRET=\"$SECRET\"/" .env
    fi
    echo "✅ NextAuth secret generated"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
echo "Please ensure PostgreSQL is running and update DATABASE_URL in .env"
echo ""
read -p "Press Enter when database is ready to continue..."

echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "📊 Pushing database schema..."
npx prisma db push

echo ""
echo "🌱 Seeding database with sample data..."
npm run seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "📝 Default login credentials:"
echo "   Email: worker@healthcare.com"
echo "   Password: password123"
echo ""
