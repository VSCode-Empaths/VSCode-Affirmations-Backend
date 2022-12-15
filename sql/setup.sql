-- Use this file to define your SQL tables
-- The SQL in this file will be executed when you run `npm run setup-db`
DROP TABLE IF EXISTS affirmations;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS github_users CASCADE;

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL
);

CREATE TABLE github_users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  login TEXT NOT NULL,
  email TEXT,
  avatar TEXT
);

CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type VARCHAR(255)
);
INSERT INTO
    categories (type)
VALUES
('daily'),
('error'),
('TDD'),
('will to go on');


CREATE TABLE affirmations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    text VARCHAR(255),
    category_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO
    affirmations (text, category_id)
VALUES

('You are enough.', 1),
('You are terrific!', 1),
('I believe in you.', 1),
('You are the CSS to my HTML.', 1),
('Today is a fresh start.', 1),
('You have the power to make your dreams come true.', 1),
('You are ready to learn.', 1),
('You are capable.', 1),
('Today I choose to be positive', 1),
('I am still independent, even if I ask for help.', 1),
('Today is going to be a good day!', 1),
('Progress not perfection!', 1),
('You can complete difficult tasks.', 1),
('You deserve to be happy.', 1),
('I am proud of you.', 1),
('You are an incredible developer.', 1),
('It is not your job to be perfect.', 1),
('I am great at my job.', 1),
('Your well-being is most important.', 1),
('I have everything I need to succeed.', 1),
('Letting go creates space for opportunities to come.', 1),
('I am not defined by how many lines of code I type.', 1),
('The code I write is beautiful and well formed.', 1),
('You are the master of your own web domain!', 1),
('You can do this!', 1),
('I AM A SOFTWARE DEVELOPER!', 1),
('I work hard.', 1),
('I am successful.', 1),
('I am smart.', 1),
('I am capable.', 1),
('Everything.', 1),
('You can do better next time!', 2),
('Imagine the happiness you will feel when you beat this error!', 2),
('401, more like 4 0 fun.', 2),
('403, I still love me!', 2),
('Your mistakes help you learn.', 2),
('Sticks and stones may break my bones, but errors will never HURT ME!', 2),
('You can solve problems.', 2),
('You are great at debugging.', 2),
('Despite your bugs, you write great code.', 2),
('I have not failed. I just made a mistake!', 2),
('You always fix your bugs!', 2),
('You are one step closer.', 2),
('I am not defined my by past 404s; I am driven by my future.', 2),
('Each and every day, I am getting closer to achieving my clean CI.', 2),
('Your worth is not defined by your errors.', 2),
('My console.logs do not define me', 2),
('It is okay to ask for help', 2),
('Do not give up.', 2),
('I strive for clean CI, not for perfection.', 2),
('I am great at debugging.', 2),
('I am smart. I can solve this bug.', 2),
('Small steps are progress.', 2),
('Trust the process.', 2),
('I celebrate my achievements, not just dwell on my mistakes.', 2),
('Everything I need to solve this bug is already inside me.', 2),
('Every error makes me better.', 2),
('Your test failed, but you are not a failure.', 3),
('When your tests fail, you are gicen the oppotunity to get better at probelm-solving. You are great at it!', 3),
('Remember how it feels when a test passes? This one will pass too.', 3),
('You deserve a break. Take a walk and come back to this test.', 3),
('It is only a test.', 3),
('I embrace the learning opportunities in every challenge.', 3),
('I am great at debugging.', 3),
('My failures do not define me.', 3),
('Test this!', 3),
('I use errors to motivate me.', 3),
('You can and you will solve this bug.', 3),
('Each error is one more step closer to the goal!', 3),
('Your value cannot be tested!', 3),
('If at first your test does not succeed, pick yourself up and try again!', 3),
('The operations/ infrastructure/ testing teams really appreciate my assistance', 3),
('I am smart. I can solve this bug.', 3),
('My code might be ugly, but I am still beautiful', 4),
('It does get better. Just keep moving forward one repo at a time.', 4),
('You matter, even if it was not a productive day.', 4),
('Your worth is not defined by your productivity.', 4),
('My family might not understand my code, and that is okay. I have websites in my life that I can rely on for support and understanding.', 4),
('A bad error does not equate to a bad life.', 4),
('I am valued!', 4),
('My errors are not invalid just because my family might not understand them.', 4),
('Your feelings are valid even if your code is not.', 4),
('Life is just a series of errors - you are right on track!', 4),
('401, more like 4 0 fun.', 4),
('403, I still love me!', 4),
('401, more like 4 0 fun.', 4),
('It is not a crisis, it is an opportunity to learn!', 4),
('Never give up, never surrender!', 4),
('I am qualified for this position, despite errors.', 4),
('I will work hard, and this test WILL pass!', 4),
('Take a deep breath!', 4),
('You can do amazing things!', 4),
('I am in control of my happiness. Not my errors.', 4);
