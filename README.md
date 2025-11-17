This Miro app demonstrates using [per-seat](https://www.salable.app/features/per-seat-pricing) billing with Salable.

## Configure Salable

1. [Sign up](https://salable.app/login) for Salable or [login](https://salable.app/login) if you already have an account.
2. Ensure you have `Test Mode` enabled.

#### Create Product

1. Go to the Products page and click the `Create Product` button.
2. Give your product any name.
3. Tick the `Paid Product` checkbox.
4. Select the test payment integration that is created for you on sign up. If you already have created a payment integration this can be used instead.
5. Select `GBP` as your currency.

#### Create Plan

1. Go to the `Plans` tab on the sidebar and select `Create Plan`
2. Set the plan name as `Basic` and optionally provide a description.
3. Select `Per seat` for pricing model..
4. Select `Month` for subscription cycle.
5. Select `Paid` to make it a paid plan.
6. Currencies will then appear, input `1` as the per-seat cost of the plan’s subscription, this will be billed to a customer every month based on how many seats they have.
7. Click `Next` to proceed to Features.
8. This section is for creating features and assigning values to plans.
9. Click `Create Feature`.
10. Create the boolean features called `rectangle` and `triangle`. These will be used to lock features behind the entitlement check in the demo app.
11. Create Plan.
12. Repeat the above steps for a `Pro` plan but with the changes in the next steps.
13. Set the per-seat cost as `2` plan which will bill the customer £2 per board they have access to.
14. Select both existing features `triangle` and `rectangle`.
15. Create a new boolean feature called circle. Set it to true on the Pro plan and false on the Basic plan.


### Update Environment Variables

1. Copy the Product ID from the `General Settings` tab and assign to `NEXT_PUBLIC_PRODUCT_UUID` in the `.env` file.
2. Go to `Plans`. Assign the `Basic` ID to `NEXT_PUBLIC_SALABLE_BASIC_PLAN_UUID` and `Pro` ID to `NEXT_PUBLIC_SALABLE_PRO_PLAN_UUID`.
3. Go to `API Keys`.
4. Copy the API Key that was generated on sign up and assign to `SALABLE_API_KEY`.
5. Run `npm run dev`


## Create a Miro app

### How to start locally

1. [Sign in](https://miro.com/login/) to Miro, and then create a
   [Developer team](https://developers.miro.com/docs/create-a-developer-team)
   under your user account.

2. [Create an app in Miro](https://developers.miro.com/docs/build-your-first-hello-world-app#step-2-create-your-app-in-miro).

- Click the **Create new app** button.
- On the **Create new app** modal, give your app a name, assign it to your
  Developer team, and then click **Create**.

3. Configure the app:

- In your account profile, go to **Your apps**, and then select the app you just
  created to access its configuration page.
- On the app configuration page, go to **App Credentials**, and copy the app
  **Client ID** and **Client secret** values: you'll need to enter these values
  in step 4 below.
- Go to **Redirect URI for OAuth2.0**, and enter the following redirect URL:
- `http://localhost:3000/api/redirect`
- Click **Options**. \
- From the drop-down menu select **Use this URI for SDK authorization**.
- Go to **App URL** and enter the following URL: `http://localhost:3000`
- Lastly, go to **Permissions**, and select the following permissions:
  - `board:read`
  - `board:write`
  - `identity:read`

4. Open the [`.env`](.env) file, and enter the app client ID and client secret
   values that you saved at the beginning of step 3 above.
5. Run `npm run start` to start developing.

When your server is up and running:

- Go to [Miro.com](https://miro.com).
- Make sure you're in your developer team and open a board.
- To start your app, click the app icon in the app toolbar on the left.
