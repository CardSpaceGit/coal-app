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
exports.id = "app/api/create-user/route";
exports.ids = ["app/api/create-user/route"];
exports.modules = {

/***/ "(rsc)/./app/api/create-user/route.ts":
/*!**************************************!*\
  !*** ./app/api/create-user/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n\nconst supabaseServer = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(\"https://ayidomlomjlrgoghbbox.supabase.co\", process.env.SUPABASE_SERVICE_ROLE_KEY, {\n    auth: {\n        autoRefreshToken: false,\n        persistSession: false\n    }\n});\nasync function POST(request) {\n    try {\n        const { email, password, fullName } = await request.json();\n        // Create user using Supabase Admin API without metadata first\n        const { data: authUser, error: authError } = await supabaseServer.auth.admin.createUser({\n            email,\n            password,\n            email_confirm: true\n        });\n        console.log('Auth user creation result:', {\n            authUser,\n            authError\n        });\n        if (authError) {\n            console.error('Auth user creation error:', authError);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: `Failed to create user: ${authError.message}`\n            }, {\n                status: 500\n            });\n        }\n        if (!authUser.user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'User creation failed - no user returned'\n            }, {\n                status: 500\n            });\n        }\n        // Now manually create the organization_users record\n        // Default to FT Coal Supply organization and Admin role\n        const { data: orgUser, error: orgError } = await supabaseServer.from('organization_users').insert({\n            organization_id: '550e8400-e29b-41d4-a716-446655440000',\n            user_id: authUser.user.id,\n            role_id: '660e8400-e29b-41d4-a716-446655440001',\n            full_name: fullName || authUser.user.email || 'New User',\n            email: authUser.user.email,\n            avatar_url: null,\n            is_active: true,\n            joined_at: new Date().toISOString()\n        }).select();\n        console.log('Organization user creation result:', {\n            orgUser,\n            orgError\n        });\n        if (orgError) {\n            console.error('Organization user creation error:', orgError);\n        // Don't fail the whole request if organization_users creation fails\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            user: {\n                id: authUser.user.id,\n                email: authUser.user.email,\n                fullName: fullName,\n                organizationUser: orgUser\n            }\n        });\n    } catch (error) {\n        console.error('API error:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Internal server error'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2NyZWF0ZS11c2VyL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFvRDtBQUNHO0FBRXZELE1BQU1FLGlCQUFpQkYsbUVBQVlBLENBQ2pDRywwQ0FBb0MsRUFDcENBLFFBQVFDLEdBQUcsQ0FBQ0UseUJBQXlCLEVBQ3JDO0lBQ0VDLE1BQU07UUFDSkMsa0JBQWtCO1FBQ2xCQyxnQkFBZ0I7SUFDbEI7QUFDRjtBQUdLLGVBQWVDLEtBQUtDLE9BQW9CO0lBQzdDLElBQUk7UUFDRixNQUFNLEVBQUVDLEtBQUssRUFBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUUsR0FBRyxNQUFNSCxRQUFRSSxJQUFJO1FBRXhELDhEQUE4RDtRQUM5RCxNQUFNLEVBQUVDLE1BQU1DLFFBQVEsRUFBRUMsT0FBT0MsU0FBUyxFQUFFLEdBQUcsTUFBTWpCLGVBQWVLLElBQUksQ0FBQ2EsS0FBSyxDQUFDQyxVQUFVLENBQUM7WUFDdEZUO1lBQ0FDO1lBQ0FTLGVBQWU7UUFDakI7UUFFQUMsUUFBUUMsR0FBRyxDQUFDLDhCQUE4QjtZQUFFUDtZQUFVRTtRQUFVO1FBRWhFLElBQUlBLFdBQVc7WUFDYkksUUFBUUwsS0FBSyxDQUFDLDZCQUE2QkM7WUFDM0MsT0FBT2xCLHFEQUFZQSxDQUFDYyxJQUFJLENBQ3RCO2dCQUFFRyxPQUFPLENBQUMsdUJBQXVCLEVBQUVDLFVBQVVNLE9BQU8sRUFBRTtZQUFDLEdBQ3ZEO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxJQUFJLENBQUNULFNBQVNVLElBQUksRUFBRTtZQUNsQixPQUFPMUIscURBQVlBLENBQUNjLElBQUksQ0FDdEI7Z0JBQUVHLE9BQU87WUFBMEMsR0FDbkQ7Z0JBQUVRLFFBQVE7WUFBSTtRQUVsQjtRQUVBLG9EQUFvRDtRQUNwRCx3REFBd0Q7UUFDeEQsTUFBTSxFQUFFVixNQUFNWSxPQUFPLEVBQUVWLE9BQU9XLFFBQVEsRUFBRSxHQUFHLE1BQU0zQixlQUM5QzRCLElBQUksQ0FBQyxzQkFDTEMsTUFBTSxDQUFDO1lBQ05DLGlCQUFpQjtZQUNqQkMsU0FBU2hCLFNBQVNVLElBQUksQ0FBQ08sRUFBRTtZQUN6QkMsU0FBUztZQUNUQyxXQUFXdEIsWUFBWUcsU0FBU1UsSUFBSSxDQUFDZixLQUFLLElBQUk7WUFDOUNBLE9BQU9LLFNBQVNVLElBQUksQ0FBQ2YsS0FBSztZQUMxQnlCLFlBQVk7WUFDWkMsV0FBVztZQUNYQyxXQUFXLElBQUlDLE9BQU9DLFdBQVc7UUFDbkMsR0FDQ0MsTUFBTTtRQUVUbkIsUUFBUUMsR0FBRyxDQUFDLHNDQUFzQztZQUFFSTtZQUFTQztRQUFTO1FBRXRFLElBQUlBLFVBQVU7WUFDWk4sUUFBUUwsS0FBSyxDQUFDLHFDQUFxQ1c7UUFDbkQsb0VBQW9FO1FBQ3RFO1FBRUEsT0FBTzVCLHFEQUFZQSxDQUFDYyxJQUFJLENBQUM7WUFDdkI0QixTQUFTO1lBQ1RoQixNQUFNO2dCQUNKTyxJQUFJakIsU0FBU1UsSUFBSSxDQUFDTyxFQUFFO2dCQUNwQnRCLE9BQU9LLFNBQVNVLElBQUksQ0FBQ2YsS0FBSztnQkFDMUJFLFVBQVVBO2dCQUNWOEIsa0JBQWtCaEI7WUFDcEI7UUFDRjtJQUVGLEVBQUUsT0FBT1YsT0FBTztRQUNkSyxRQUFRTCxLQUFLLENBQUMsY0FBY0E7UUFDNUIsT0FBT2pCLHFEQUFZQSxDQUFDYyxJQUFJLENBQ3RCO1lBQUVHLE9BQU87UUFBd0IsR0FDakM7WUFBRVEsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIi9Vc2Vycy9ucW9lL0Rvd25sb2Fkcy9jb2FsLWFwcC9hcHAvYXBpL2NyZWF0ZS11c2VyL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcbmltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcblxuY29uc3Qgc3VwYWJhc2VTZXJ2ZXIgPSBjcmVhdGVDbGllbnQoXG4gIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCEsXG4gIHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkhLFxuICB7XG4gICAgYXV0aDoge1xuICAgICAgYXV0b1JlZnJlc2hUb2tlbjogZmFsc2UsXG4gICAgICBwZXJzaXN0U2Vzc2lvbjogZmFsc2VcbiAgICB9XG4gIH1cbilcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogTmV4dFJlcXVlc3QpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGVtYWlsLCBwYXNzd29yZCwgZnVsbE5hbWUgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpXG5cbiAgICAvLyBDcmVhdGUgdXNlciB1c2luZyBTdXBhYmFzZSBBZG1pbiBBUEkgd2l0aG91dCBtZXRhZGF0YSBmaXJzdFxuICAgIGNvbnN0IHsgZGF0YTogYXV0aFVzZXIsIGVycm9yOiBhdXRoRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlU2VydmVyLmF1dGguYWRtaW4uY3JlYXRlVXNlcih7XG4gICAgICBlbWFpbCxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgZW1haWxfY29uZmlybTogdHJ1ZSxcbiAgICB9KVxuXG4gICAgY29uc29sZS5sb2coJ0F1dGggdXNlciBjcmVhdGlvbiByZXN1bHQ6JywgeyBhdXRoVXNlciwgYXV0aEVycm9yIH0pXG5cbiAgICBpZiAoYXV0aEVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBdXRoIHVzZXIgY3JlYXRpb24gZXJyb3I6JywgYXV0aEVycm9yKVxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiBgRmFpbGVkIHRvIGNyZWF0ZSB1c2VyOiAke2F1dGhFcnJvci5tZXNzYWdlfWAgfSxcbiAgICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgaWYgKCFhdXRoVXNlci51c2VyKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6ICdVc2VyIGNyZWF0aW9uIGZhaWxlZCAtIG5vIHVzZXIgcmV0dXJuZWQnIH0sXG4gICAgICAgIHsgc3RhdHVzOiA1MDAgfVxuICAgICAgKVxuICAgIH1cblxuICAgIC8vIE5vdyBtYW51YWxseSBjcmVhdGUgdGhlIG9yZ2FuaXphdGlvbl91c2VycyByZWNvcmRcbiAgICAvLyBEZWZhdWx0IHRvIEZUIENvYWwgU3VwcGx5IG9yZ2FuaXphdGlvbiBhbmQgQWRtaW4gcm9sZVxuICAgIGNvbnN0IHsgZGF0YTogb3JnVXNlciwgZXJyb3I6IG9yZ0Vycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVNlcnZlclxuICAgICAgLmZyb20oJ29yZ2FuaXphdGlvbl91c2VycycpXG4gICAgICAuaW5zZXJ0KHtcbiAgICAgICAgb3JnYW5pemF0aW9uX2lkOiAnNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwJywgLy8gRlQgQ29hbCBTdXBwbHlcbiAgICAgICAgdXNlcl9pZDogYXV0aFVzZXIudXNlci5pZCxcbiAgICAgICAgcm9sZV9pZDogJzY2MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMScsIC8vIEFkbWluXG4gICAgICAgIGZ1bGxfbmFtZTogZnVsbE5hbWUgfHwgYXV0aFVzZXIudXNlci5lbWFpbCB8fCAnTmV3IFVzZXInLFxuICAgICAgICBlbWFpbDogYXV0aFVzZXIudXNlci5lbWFpbCxcbiAgICAgICAgYXZhdGFyX3VybDogbnVsbCxcbiAgICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgICBqb2luZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfSlcbiAgICAgIC5zZWxlY3QoKVxuXG4gICAgY29uc29sZS5sb2coJ09yZ2FuaXphdGlvbiB1c2VyIGNyZWF0aW9uIHJlc3VsdDonLCB7IG9yZ1VzZXIsIG9yZ0Vycm9yIH0pXG5cbiAgICBpZiAob3JnRXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ09yZ2FuaXphdGlvbiB1c2VyIGNyZWF0aW9uIGVycm9yOicsIG9yZ0Vycm9yKVxuICAgICAgLy8gRG9uJ3QgZmFpbCB0aGUgd2hvbGUgcmVxdWVzdCBpZiBvcmdhbml6YXRpb25fdXNlcnMgY3JlYXRpb24gZmFpbHNcbiAgICB9XG5cbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oe1xuICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIHVzZXI6IHtcbiAgICAgICAgaWQ6IGF1dGhVc2VyLnVzZXIuaWQsXG4gICAgICAgIGVtYWlsOiBhdXRoVXNlci51c2VyLmVtYWlsLFxuICAgICAgICBmdWxsTmFtZTogZnVsbE5hbWUsXG4gICAgICAgIG9yZ2FuaXphdGlvblVzZXI6IG9yZ1VzZXJcbiAgICAgIH1cbiAgICB9KVxuXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignQVBJIGVycm9yOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcbiAgICAgIHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApXG4gIH1cbn0gIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsIk5leHRSZXNwb25zZSIsInN1cGFiYXNlU2VydmVyIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkiLCJhdXRoIiwiYXV0b1JlZnJlc2hUb2tlbiIsInBlcnNpc3RTZXNzaW9uIiwiUE9TVCIsInJlcXVlc3QiLCJlbWFpbCIsInBhc3N3b3JkIiwiZnVsbE5hbWUiLCJqc29uIiwiZGF0YSIsImF1dGhVc2VyIiwiZXJyb3IiLCJhdXRoRXJyb3IiLCJhZG1pbiIsImNyZWF0ZVVzZXIiLCJlbWFpbF9jb25maXJtIiwiY29uc29sZSIsImxvZyIsIm1lc3NhZ2UiLCJzdGF0dXMiLCJ1c2VyIiwib3JnVXNlciIsIm9yZ0Vycm9yIiwiZnJvbSIsImluc2VydCIsIm9yZ2FuaXphdGlvbl9pZCIsInVzZXJfaWQiLCJpZCIsInJvbGVfaWQiLCJmdWxsX25hbWUiLCJhdmF0YXJfdXJsIiwiaXNfYWN0aXZlIiwiam9pbmVkX2F0IiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwic2VsZWN0Iiwic3VjY2VzcyIsIm9yZ2FuaXphdGlvblVzZXIiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/create-user/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcreate-user%2Froute&page=%2Fapi%2Fcreate-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-user%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcreate-user%2Froute&page=%2Fapi%2Fcreate-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-user%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_nqoe_Downloads_coal_app_app_api_create_user_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/create-user/route.ts */ \"(rsc)/./app/api/create-user/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/create-user/route\",\n        pathname: \"/api/create-user\",\n        filename: \"route\",\n        bundlePath: \"app/api/create-user/route\"\n    },\n    resolvedPagePath: \"/Users/nqoe/Downloads/coal-app/app/api/create-user/route.ts\",\n    nextConfigOutput,\n    userland: _Users_nqoe_Downloads_coal_app_app_api_create_user_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZjcmVhdGUtdXNlciUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGY3JlYXRlLXVzZXIlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZjcmVhdGUtdXNlciUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm5xb2UlMkZEb3dubG9hZHMlMkZjb2FsLWFwcCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZucW9lJTJGRG93bmxvYWRzJTJGY29hbC1hcHAmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ1c7QUFDeEY7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIi9Vc2Vycy9ucW9lL0Rvd25sb2Fkcy9jb2FsLWFwcC9hcHAvYXBpL2NyZWF0ZS11c2VyL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9jcmVhdGUtdXNlci9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2NyZWF0ZS11c2VyXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9jcmVhdGUtdXNlci9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9ucW9lL0Rvd25sb2Fkcy9jb2FsLWFwcC9hcHAvYXBpL2NyZWF0ZS11c2VyL3JvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcreate-user%2Froute&page=%2Fapi%2Fcreate-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-user%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/ws","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fcreate-user%2Froute&page=%2Fapi%2Fcreate-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fcreate-user%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();