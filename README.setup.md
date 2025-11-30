# MongoDB Atlas Setup & Local Testing

This guide helps you verify/create a MongoDB Atlas user, whitelist your IP, and test connectivity locally.

## 1) Verify or Create a Database User in Atlas
1. Sign in to MongoDB Atlas: https://cloud.mongodb.com
2. Select your project and then open "Database Access" (left side menu).
3. Check the list of Database Users:
   - If you see a user that you want to use (e.g., `dzifa`), click on the three dots and choose `Edit` to reset the password, or `Delete` then `Add New Database User` to recreate.
   - If you need to create a new user, click **Add New Database User**.
     - Authentication Method: Password
     - Username: choose a name (e.g., `dzifa`)
     - Password: Create a strong password or click **Autogenerate secure password**
     - Database User Privileges: Choose `Atlas Admin` or `Read and write to any database` for development. For least privilege, pick `Read and write` to your app database (`ExpenseTracker`).
     - Click **Add User**. Atlas saves the user and propagates the new credentials (this may take a minute).

## 2) Whitelist Your IP (Network Access)
1. Go to "Network Access" in the left-hand menu.
2. Click **Add IP Address**. You can either:
   - Click **Add Current IP Address** to allow only your machine; or
   - Enter `0.0.0.0/0` (not recommended long-term — but useful for quick dev testing).
3. Save.

Note: If your internet address changes (e.g., laptop switching networks), update this list.

## 3) Copy the Connection String
1. Go to the "Clusters" page and select **Connect** for your cluster.
2. Choose **Connect your application** and copy the connection string.
   - Example: `mongodb+srv://<username>:<password>@cluster0.wbuyhpw.mongodb.net/ExpenseTracker?retryWrites=true&w=majority`
3. Replace `<username>` and `<password>` with your values. If the password contains special characters, you must URL-encode it.

## 4) Test with mongosh (recommended)
Use the connection string from Atlas; replace `cluster0.wbuyhpw.mongodb.net` and `ExpenseTracker` with your data.

PowerShell example (it will prompt for the password):
```
mongosh "mongodb+srv://cluster0.wbuyhpw.mongodb.net/ExpenseTracker" -u dzifa -p
```
If you prefer to include the password inline, URL-encode it. Here are two options for URL-encoding special characters in the password:

PowerShell (Windows):
```
[System.Net.WebUtility]::UrlEncode('p@ssw0rd!')
```
Node.js:
```
node -e "console.log(encodeURIComponent('p@ssw0rd!'))"
```

Then use the URL-encoded value in the connection string:
```
mongosh "mongodb+srv://dzifa:encodedPassword@cluster0.wbuyhpw.mongodb.net/ExpenseTracker?retryWrites=true&w=majority"
```

## 5) Test with the project script
From your project root:
```
cd backend
npm run testdb
```

If the connection succeeds you'll see `Connection successful`. If it fails with `bad auth : authentication failed`, check steps above and reset the password.

## Troubleshooting
- `bad auth : authentication failed`: Confirm username and password; check the host string and database; ensure password is URL-encoded when using a URI.
- `Network Error`: Check your IP whitelist in Network Access and that your cluster is deployed and not paused.
- `User role/privileges`: Ensure the DB user has at least read/write privileges on the database used by your app.

## Security Best Practices
- Use environment variables for credentials and do not commit real passwords to source control.
- Use `Atlas Project API Keys` if automating user creation or managing resources from CI.
- Use least privilege for DB users (limit to a specific DB rather than granting admin in production).
