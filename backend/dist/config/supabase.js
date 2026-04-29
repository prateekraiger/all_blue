"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('⚠️  Supabase env vars not set — some features may not work correctly');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceRoleKey || 'placeholder', {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
exports.default = supabase;
//# sourceMappingURL=supabase.js.map