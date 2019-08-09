# *1.1.0 / 2019-08-08 @1805*
Received feedback on major functionality issues due to registration logic not working:
*Root cause and Corrective actions*
  - The if statement to check if an user already exists did not use the correct syntax to test for a null object
    - Code used (getUserByEmail === {})
    - Code should be (Object.keys(getUserByEmail).length as the strict comparison will return the object type instead of value
  - Double-checked all existing codes with {} to ensure all syntax are fixed

# *1.0.0 / 2019-08-08 @1415*
Submitted file