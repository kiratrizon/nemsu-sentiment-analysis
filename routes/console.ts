import { Cache } from "Illuminate/Support/Facades/index.ts";

// everyday at 12am
Deno.cron("insertData", "0 0 * * *", async () => {
    const store = Cache.store("research");
    const dateListed = await store.get("insertDataTimestamp");
    const today = date("Y-m-d 00:00:00");
    if ((await store.has("insertData")) && dateListed && dateListed !== today) {
        // forget
        await store.forget("insertData");
        await store.forget("insertDataTimestamp");
    }
});
