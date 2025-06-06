/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/admin/create-user/route";
exports.ids = ["app/api/admin/create-user/route"];
exports.modules = {

/***/ "(rsc)/./app/api/admin/create-user/route.ts":
/*!********************************************!*\
  !*** ./app/api/admin/create-user/route.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n\n// Create admin client with service role key for server-side operations\nconst supabaseUrl = \"https://ayidomlomjlrgoghbbox.supabase.co\";\nconst serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\nif (!supabaseUrl) {\n    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');\n}\nif (!serviceRoleKey) {\n    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');\n}\nconst supabaseAdmin = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(supabaseUrl, serviceRoleKey, {\n    auth: {\n        autoRefreshToken: false,\n        persistSession: false\n    }\n});\nasync function POST(request) {\n    try {\n        const body = await request.json();\n        const { email, password, full_name, organization_id, role_id, cellphone, is_active } = body;\n        console.log('API: Creating user with admin privileges...', {\n            email,\n            full_name\n        });\n        // Create auth user with admin privileges\n        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({\n            email,\n            password,\n            user_metadata: {\n                full_name,\n                organization_id,\n                role_id,\n                is_active\n            },\n            email_confirm: true // Auto-confirm email for admin-created users\n        });\n        console.log('API: Auth user creation response:', {\n            authUser,\n            authError\n        });\n        if (authError) {\n            console.error('API: Auth user creation error:', authError);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: `Authentication failed: ${authError.message}`\n            }, {\n                status: 400\n            });\n        }\n        if (!authUser.user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Failed to create auth user - no user returned'\n            }, {\n                status: 400\n            });\n        }\n        console.log('API: Auth user created successfully:', {\n            id: authUser.user.id,\n            email: authUser.user.email,\n            email_confirmed_at: authUser.user.email_confirmed_at\n        });\n        // Create organization_users profile\n        console.log('API: Creating organization user profile...');\n        const { data: profileData, error: profileError } = await supabaseAdmin.from('organization_users').insert({\n            user_id: authUser.user.id,\n            organization_id,\n            role_id,\n            full_name,\n            email,\n            cellphone: cellphone || null,\n            is_active,\n            joined_at: new Date().toISOString(),\n            created_at: new Date().toISOString(),\n            updated_at: new Date().toISOString()\n        }).select().single();\n        console.log('API: Profile creation response:', {\n            profileData,\n            profileError\n        });\n        if (profileError) {\n            console.error('API: Profile creation error:', profileError);\n            // If profile creation fails, clean up the auth user\n            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: `Profile creation failed: ${profileError.message}`,\n                details: profileError.details,\n                hint: profileError.hint,\n                code: profileError.code\n            }, {\n                status: 400\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            user: profileData,\n            auth_user_id: authUser.user.id\n        });\n    } catch (error) {\n        console.error('API: Unexpected error:', error);\n        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: `Server error: ${errorMessage}`\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FkbWluL2NyZWF0ZS11c2VyL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFvRDtBQUNWO0FBRTFDLHVFQUF1RTtBQUN2RSxNQUFNRSxjQUFjQywwQ0FBb0M7QUFDeEQsTUFBTUcsaUJBQWlCSCxRQUFRQyxHQUFHLENBQUNHLHlCQUF5QjtBQUU1RCxJQUFJLENBQUNMLGFBQWE7SUFDaEIsTUFBTSxJQUFJTSxNQUFNO0FBQ2xCO0FBRUEsSUFBSSxDQUFDRixnQkFBZ0I7SUFDbkIsTUFBTSxJQUFJRSxNQUFNO0FBQ2xCO0FBRUEsTUFBTUMsZ0JBQWdCVCxtRUFBWUEsQ0FDaENFLGFBQ0FJLGdCQUNBO0lBQ0VJLE1BQU07UUFDSkMsa0JBQWtCO1FBQ2xCQyxnQkFBZ0I7SUFDbEI7QUFDRjtBQUdLLGVBQWVDLEtBQUtDLE9BQWdCO0lBQ3pDLElBQUk7UUFDRixNQUFNQyxPQUFPLE1BQU1ELFFBQVFFLElBQUk7UUFDL0IsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLFFBQVEsRUFBRUMsU0FBUyxFQUFFQyxlQUFlLEVBQUVDLE9BQU8sRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQUUsR0FBR1I7UUFFdkZTLFFBQVFDLEdBQUcsQ0FBQywrQ0FBK0M7WUFBRVI7WUFBT0U7UUFBVTtRQUU5RSx5Q0FBeUM7UUFDekMsTUFBTSxFQUFFTyxNQUFNQyxRQUFRLEVBQUVDLE9BQU9DLFNBQVMsRUFBRSxHQUFHLE1BQU1wQixjQUFjQyxJQUFJLENBQUNvQixLQUFLLENBQUNDLFVBQVUsQ0FBQztZQUNyRmQ7WUFDQUM7WUFDQWMsZUFBZTtnQkFDYmI7Z0JBQ0FDO2dCQUNBQztnQkFDQUU7WUFDRjtZQUNBVSxlQUFlLEtBQUssNkNBQTZDO1FBQ25FO1FBRUFULFFBQVFDLEdBQUcsQ0FBQyxxQ0FBcUM7WUFBRUU7WUFBVUU7UUFBVTtRQUV2RSxJQUFJQSxXQUFXO1lBQ2JMLFFBQVFJLEtBQUssQ0FBQyxrQ0FBa0NDO1lBQ2hELE9BQU81QixxREFBWUEsQ0FBQ2UsSUFBSSxDQUN0QjtnQkFBRVksT0FBTyxDQUFDLHVCQUF1QixFQUFFQyxVQUFVSyxPQUFPLEVBQUU7WUFBQyxHQUN2RDtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsSUFBSSxDQUFDUixTQUFTUyxJQUFJLEVBQUU7WUFDbEIsT0FBT25DLHFEQUFZQSxDQUFDZSxJQUFJLENBQ3RCO2dCQUFFWSxPQUFPO1lBQWdELEdBQ3pEO2dCQUFFTyxRQUFRO1lBQUk7UUFFbEI7UUFFQVgsUUFBUUMsR0FBRyxDQUFDLHdDQUF3QztZQUNsRFksSUFBSVYsU0FBU1MsSUFBSSxDQUFDQyxFQUFFO1lBQ3BCcEIsT0FBT1UsU0FBU1MsSUFBSSxDQUFDbkIsS0FBSztZQUMxQnFCLG9CQUFvQlgsU0FBU1MsSUFBSSxDQUFDRSxrQkFBa0I7UUFDdEQ7UUFFQSxvQ0FBb0M7UUFDcENkLFFBQVFDLEdBQUcsQ0FBQztRQUNaLE1BQU0sRUFBRUMsTUFBTWEsV0FBVyxFQUFFWCxPQUFPWSxZQUFZLEVBQUUsR0FBRyxNQUFNL0IsY0FDdERnQyxJQUFJLENBQUMsc0JBQ0xDLE1BQU0sQ0FBQztZQUNOQyxTQUFTaEIsU0FBU1MsSUFBSSxDQUFDQyxFQUFFO1lBQ3pCakI7WUFDQUM7WUFDQUY7WUFDQUY7WUFDQUssV0FBV0EsYUFBYTtZQUN4QkM7WUFDQXFCLFdBQVcsSUFBSUMsT0FBT0MsV0FBVztZQUNqQ0MsWUFBWSxJQUFJRixPQUFPQyxXQUFXO1lBQ2xDRSxZQUFZLElBQUlILE9BQU9DLFdBQVc7UUFDcEMsR0FDQ0csTUFBTSxHQUNOQyxNQUFNO1FBRVQxQixRQUFRQyxHQUFHLENBQUMsbUNBQW1DO1lBQUVjO1lBQWFDO1FBQWE7UUFFM0UsSUFBSUEsY0FBYztZQUNoQmhCLFFBQVFJLEtBQUssQ0FBQyxnQ0FBZ0NZO1lBQzlDLG9EQUFvRDtZQUNwRCxNQUFNL0IsY0FBY0MsSUFBSSxDQUFDb0IsS0FBSyxDQUFDcUIsVUFBVSxDQUFDeEIsU0FBU1MsSUFBSSxDQUFDQyxFQUFFO1lBRTFELE9BQU9wQyxxREFBWUEsQ0FBQ2UsSUFBSSxDQUN0QjtnQkFDRVksT0FBTyxDQUFDLHlCQUF5QixFQUFFWSxhQUFhTixPQUFPLEVBQUU7Z0JBQ3pEa0IsU0FBU1osYUFBYVksT0FBTztnQkFDN0JDLE1BQU1iLGFBQWFhLElBQUk7Z0JBQ3ZCQyxNQUFNZCxhQUFhYyxJQUFJO1lBQ3pCLEdBQ0E7Z0JBQUVuQixRQUFRO1lBQUk7UUFFbEI7UUFFQSxPQUFPbEMscURBQVlBLENBQUNlLElBQUksQ0FBQztZQUN2QnVDLFNBQVM7WUFDVG5CLE1BQU1HO1lBQ05pQixjQUFjN0IsU0FBU1MsSUFBSSxDQUFDQyxFQUFFO1FBQ2hDO0lBRUYsRUFBRSxPQUFPVCxPQUFPO1FBQ2RKLFFBQVFJLEtBQUssQ0FBQywwQkFBMEJBO1FBQ3hDLE1BQU02QixlQUFlN0IsaUJBQWlCcEIsUUFBUW9CLE1BQU1NLE9BQU8sR0FBRztRQUM5RCxPQUFPakMscURBQVlBLENBQUNlLElBQUksQ0FDdEI7WUFBRVksT0FBTyxDQUFDLGNBQWMsRUFBRTZCLGNBQWM7UUFBQyxHQUN6QztZQUFFdEIsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy9ucW9lL0Rvd25sb2Fkcy9jb2FsLWFwcC9hcHAvYXBpL2FkbWluL2NyZWF0ZS11c2VyL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcbmltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuXG4vLyBDcmVhdGUgYWRtaW4gY2xpZW50IHdpdGggc2VydmljZSByb2xlIGtleSBmb3Igc2VydmVyLXNpZGUgb3BlcmF0aW9uc1xuY29uc3Qgc3VwYWJhc2VVcmwgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkxcbmNvbnN0IHNlcnZpY2VSb2xlS2V5ID0gcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWVxuXG5pZiAoIXN1cGFiYXNlVXJsKSB7XG4gIHRocm93IG5ldyBFcnJvcignTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIGVudmlyb25tZW50IHZhcmlhYmxlIGlzIHJlcXVpcmVkJylcbn1cblxuaWYgKCFzZXJ2aWNlUm9sZUtleSkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ1NVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkgZW52aXJvbm1lbnQgdmFyaWFibGUgaXMgcmVxdWlyZWQnKVxufVxuXG5jb25zdCBzdXBhYmFzZUFkbWluID0gY3JlYXRlQ2xpZW50KFxuICBzdXBhYmFzZVVybCxcbiAgc2VydmljZVJvbGVLZXksXG4gIHtcbiAgICBhdXRoOiB7XG4gICAgICBhdXRvUmVmcmVzaFRva2VuOiBmYWxzZSxcbiAgICAgIHBlcnNpc3RTZXNzaW9uOiBmYWxzZVxuICAgIH1cbiAgfVxuKVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcXVlc3QuanNvbigpXG4gICAgY29uc3QgeyBlbWFpbCwgcGFzc3dvcmQsIGZ1bGxfbmFtZSwgb3JnYW5pemF0aW9uX2lkLCByb2xlX2lkLCBjZWxscGhvbmUsIGlzX2FjdGl2ZSB9ID0gYm9keVxuXG4gICAgY29uc29sZS5sb2coJ0FQSTogQ3JlYXRpbmcgdXNlciB3aXRoIGFkbWluIHByaXZpbGVnZXMuLi4nLCB7IGVtYWlsLCBmdWxsX25hbWUgfSlcblxuICAgIC8vIENyZWF0ZSBhdXRoIHVzZXIgd2l0aCBhZG1pbiBwcml2aWxlZ2VzXG4gICAgY29uc3QgeyBkYXRhOiBhdXRoVXNlciwgZXJyb3I6IGF1dGhFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VBZG1pbi5hdXRoLmFkbWluLmNyZWF0ZVVzZXIoe1xuICAgICAgZW1haWwsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHVzZXJfbWV0YWRhdGE6IHtcbiAgICAgICAgZnVsbF9uYW1lLFxuICAgICAgICBvcmdhbml6YXRpb25faWQsXG4gICAgICAgIHJvbGVfaWQsXG4gICAgICAgIGlzX2FjdGl2ZVxuICAgICAgfSxcbiAgICAgIGVtYWlsX2NvbmZpcm06IHRydWUgLy8gQXV0by1jb25maXJtIGVtYWlsIGZvciBhZG1pbi1jcmVhdGVkIHVzZXJzXG4gICAgfSlcblxuICAgIGNvbnNvbGUubG9nKCdBUEk6IEF1dGggdXNlciBjcmVhdGlvbiByZXNwb25zZTonLCB7IGF1dGhVc2VyLCBhdXRoRXJyb3IgfSlcblxuICAgIGlmIChhdXRoRXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0FQSTogQXV0aCB1c2VyIGNyZWF0aW9uIGVycm9yOicsIGF1dGhFcnJvcilcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBlcnJvcjogYEF1dGhlbnRpY2F0aW9uIGZhaWxlZDogJHthdXRoRXJyb3IubWVzc2FnZX1gIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDAgfVxuICAgICAgKVxuICAgIH1cblxuICAgIGlmICghYXV0aFVzZXIudXNlcikge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnRmFpbGVkIHRvIGNyZWF0ZSBhdXRoIHVzZXIgLSBubyB1c2VyIHJldHVybmVkJyB9LFxuICAgICAgICB7IHN0YXR1czogNDAwIH1cbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnQVBJOiBBdXRoIHVzZXIgY3JlYXRlZCBzdWNjZXNzZnVsbHk6Jywge1xuICAgICAgaWQ6IGF1dGhVc2VyLnVzZXIuaWQsXG4gICAgICBlbWFpbDogYXV0aFVzZXIudXNlci5lbWFpbCxcbiAgICAgIGVtYWlsX2NvbmZpcm1lZF9hdDogYXV0aFVzZXIudXNlci5lbWFpbF9jb25maXJtZWRfYXRcbiAgICB9KVxuXG4gICAgLy8gQ3JlYXRlIG9yZ2FuaXphdGlvbl91c2VycyBwcm9maWxlXG4gICAgY29uc29sZS5sb2coJ0FQSTogQ3JlYXRpbmcgb3JnYW5pemF0aW9uIHVzZXIgcHJvZmlsZS4uLicpXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlRGF0YSwgZXJyb3I6IHByb2ZpbGVFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VBZG1pblxuICAgICAgLmZyb20oJ29yZ2FuaXphdGlvbl91c2VycycpXG4gICAgICAuaW5zZXJ0KHtcbiAgICAgICAgdXNlcl9pZDogYXV0aFVzZXIudXNlci5pZCxcbiAgICAgICAgb3JnYW5pemF0aW9uX2lkLFxuICAgICAgICByb2xlX2lkLFxuICAgICAgICBmdWxsX25hbWUsXG4gICAgICAgIGVtYWlsLFxuICAgICAgICBjZWxscGhvbmU6IGNlbGxwaG9uZSB8fCBudWxsLFxuICAgICAgICBpc19hY3RpdmUsXG4gICAgICAgIGpvaW5lZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICBjcmVhdGVkX2F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIHVwZGF0ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfSlcbiAgICAgIC5zZWxlY3QoKVxuICAgICAgLnNpbmdsZSgpXG5cbiAgICBjb25zb2xlLmxvZygnQVBJOiBQcm9maWxlIGNyZWF0aW9uIHJlc3BvbnNlOicsIHsgcHJvZmlsZURhdGEsIHByb2ZpbGVFcnJvciB9KVxuXG4gICAgaWYgKHByb2ZpbGVFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignQVBJOiBQcm9maWxlIGNyZWF0aW9uIGVycm9yOicsIHByb2ZpbGVFcnJvcilcbiAgICAgIC8vIElmIHByb2ZpbGUgY3JlYXRpb24gZmFpbHMsIGNsZWFuIHVwIHRoZSBhdXRoIHVzZXJcbiAgICAgIGF3YWl0IHN1cGFiYXNlQWRtaW4uYXV0aC5hZG1pbi5kZWxldGVVc2VyKGF1dGhVc2VyLnVzZXIuaWQpXG4gICAgICBcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgICAgeyBcbiAgICAgICAgICBlcnJvcjogYFByb2ZpbGUgY3JlYXRpb24gZmFpbGVkOiAke3Byb2ZpbGVFcnJvci5tZXNzYWdlfWAsXG4gICAgICAgICAgZGV0YWlsczogcHJvZmlsZUVycm9yLmRldGFpbHMsXG4gICAgICAgICAgaGludDogcHJvZmlsZUVycm9yLmhpbnQsXG4gICAgICAgICAgY29kZTogcHJvZmlsZUVycm9yLmNvZGVcbiAgICAgICAgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICB1c2VyOiBwcm9maWxlRGF0YSxcbiAgICAgIGF1dGhfdXNlcl9pZDogYXV0aFVzZXIudXNlci5pZFxuICAgIH0pXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdBUEk6IFVuZXhwZWN0ZWQgZXJyb3I6JywgZXJyb3IpXG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCdcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IGVycm9yOiBgU2VydmVyIGVycm9yOiAke2Vycm9yTWVzc2FnZX1gIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApXG4gIH1cbn0gIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsIk5leHRSZXNwb25zZSIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInNlcnZpY2VSb2xlS2V5IiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsIkVycm9yIiwic3VwYWJhc2VBZG1pbiIsImF1dGgiLCJhdXRvUmVmcmVzaFRva2VuIiwicGVyc2lzdFNlc3Npb24iLCJQT1NUIiwicmVxdWVzdCIsImJvZHkiLCJqc29uIiwiZW1haWwiLCJwYXNzd29yZCIsImZ1bGxfbmFtZSIsIm9yZ2FuaXphdGlvbl9pZCIsInJvbGVfaWQiLCJjZWxscGhvbmUiLCJpc19hY3RpdmUiLCJjb25zb2xlIiwibG9nIiwiZGF0YSIsImF1dGhVc2VyIiwiZXJyb3IiLCJhdXRoRXJyb3IiLCJhZG1pbiIsImNyZWF0ZVVzZXIiLCJ1c2VyX21ldGFkYXRhIiwiZW1haWxfY29uZmlybSIsIm1lc3NhZ2UiLCJzdGF0dXMiLCJ1c2VyIiwiaWQiLCJlbWFpbF9jb25maXJtZWRfYXQiLCJwcm9maWxlRGF0YSIsInByb2ZpbGVFcnJvciIsImZyb20iLCJpbnNlcnQiLCJ1c2VyX2lkIiwiam9pbmVkX2F0IiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwiY3JlYXRlZF9hdCIsInVwZGF0ZWRfYXQiLCJzZWxlY3QiLCJzaW5nbGUiLCJkZWxldGVVc2VyIiwiZGV0YWlscyIsImhpbnQiLCJjb2RlIiwic3VjY2VzcyIsImF1dGhfdXNlcl9pZCIsImVycm9yTWVzc2FnZSJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admin/create-user/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Fcreate-user%2Froute&page=%2Fapi%2Fadmin%2Fcreate-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcreate-user%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Fcreate-user%2Froute&page=%2Fapi%2Fadmin%2Fcreate-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcreate-user%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_nqoe_Downloads_coal_app_app_api_admin_create_user_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admin/create-user/route.ts */ \"(rsc)/./app/api/admin/create-user/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admin/create-user/route\",\n        pathname: \"/api/admin/create-user\",\n        filename: \"route\",\n        bundlePath: \"app/api/admin/create-user/route\"\n    },\n    resolvedPagePath: \"/Users/nqoe/Downloads/coal-app/app/api/admin/create-user/route.ts\",\n    nextConfigOutput,\n    userland: _Users_nqoe_Downloads_coal_app_app_api_admin_create_user_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbiUyRmNyZWF0ZS11c2VyJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhZG1pbiUyRmNyZWF0ZS11c2VyJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYWRtaW4lMkZjcmVhdGUtdXNlciUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm5xb2UlMkZEb3dubG9hZHMlMkZjb2FsLWFwcCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZucW9lJTJGRG93bmxvYWRzJTJGY29hbC1hcHAmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ2lCO0FBQzlGO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvbnFvZS9Eb3dubG9hZHMvY29hbC1hcHAvYXBwL2FwaS9hZG1pbi9jcmVhdGUtdXNlci9yb3V0ZS50c1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYWRtaW4vY3JlYXRlLXVzZXIvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hZG1pbi9jcmVhdGUtdXNlclwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYWRtaW4vY3JlYXRlLXVzZXIvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCIvVXNlcnMvbnFvZS9Eb3dubG9hZHMvY29hbC1hcHAvYXBwL2FwaS9hZG1pbi9jcmVhdGUtdXNlci9yb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Fcreate-user%2Froute&page=%2Fapi%2Fadmin%2Fcreate-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcreate-user%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "?32c4":
/*!****************************!*\
  !*** bufferutil (ignored) ***!
  \****************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?66e9":
/*!********************************!*\
  !*** utf-8-validate (ignored) ***!
  \********************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "net":
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "tls":
/*!**********************!*\
  !*** external "tls" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/ws","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Fcreate-user%2Froute&page=%2Fapi%2Fadmin%2Fcreate-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fcreate-user%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();