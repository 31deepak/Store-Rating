/*
  # Store Rating System Schema

  1. New Tables
    - `profiles`
      - Stores user profile information
      - Links to Supabase auth.users
    - `stores`
      - Stores information about registered stores
    - `ratings`
      - Stores user ratings for stores
    
  2. Security
    - Enable RLS on all tables
    - Add policies for different user roles
    
  3. Enums
    - `user_role` for different types of users
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user', 'store_owner');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name varchar(60) NOT NULL CHECK (char_length(name) >= 20),
  email text NOT NULL UNIQUE,
  address varchar(400) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(60) NOT NULL CHECK (char_length(name) >= 20),
  email text NOT NULL UNIQUE,
  address varchar(400) NOT NULL,
  owner_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for stores
CREATE POLICY "Stores are viewable by everyone"
  ON stores FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert stores"
  ON stores FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can update stores"
  ON stores FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Policies for ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create views for analytics
CREATE OR REPLACE VIEW store_analytics AS
SELECT 
  s.id,
  s.name,
  s.email,
  s.address,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(DISTINCT r.user_id) as total_ratings
FROM stores s
LEFT JOIN ratings r ON s.id = r.store_id
GROUP BY s.id, s.name, s.email, s.address;

-- Functions for analytics
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS TABLE (
  total_users bigint,
  total_stores bigint,
  total_ratings bigint
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM stores) as total_stores,
    (SELECT COUNT(*) FROM ratings) as total_ratings;
$$;