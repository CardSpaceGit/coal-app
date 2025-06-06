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
exports.id = "app/api/admin/confirm-email/route";
exports.ids = ["app/api/admin/confirm-email/route"];
exports.modules = {

/***/ "(rsc)/./app/api/admin/confirm-email/route.ts":
/*!**********************************************!*\
  !*** ./app/api/admin/confirm-email/route.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n\n// Create admin client with service role key\nconst supabaseUrl = \"https://ayidomlomjlrgoghbbox.supabase.co\";\nconst serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\nif (!supabaseUrl || !serviceRoleKey) {\n    throw new Error('Missing Supabase environment variables');\n}\nconst supabaseAdmin = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(supabaseUrl, serviceRoleKey, {\n    auth: {\n        autoRefreshToken: false,\n        persistSession: false\n    }\n});\nasync function POST(request) {\n    try {\n        const { email } = await request.json();\n        if (!email) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Email is required'\n            }, {\n                status: 400\n            });\n        }\n        // Get the user by email\n        const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();\n        if (listError) {\n            console.error('Error listing users:', listError);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Failed to find user'\n            }, {\n                status: 500\n            });\n        }\n        const user = users.users.find((u)=>u.email === email);\n        if (!user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'User not found'\n            }, {\n                status: 404\n            });\n        }\n        // Get the user's organization data to set proper metadata\n        const { data: orgUser } = await supabaseAdmin.from('organization_users').select('organization_id, role_id, is_active').eq('user_id', user.id).single();\n        // Update user to confirm email and set proper metadata\n        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {\n            email_confirm: true,\n            user_metadata: {\n                ...user.user_metadata,\n                organization_id: orgUser?.organization_id,\n                role_id: orgUser?.role_id,\n                is_active: orgUser?.is_active || true\n            }\n        });\n        if (updateError) {\n            console.error('Error confirming email:', updateError);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: `Failed to confirm email: ${updateError.message}`\n            }, {\n                status: 500\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            message: `Email confirmed for ${email}`,\n            user: {\n                id: updatedUser.user.id,\n                email: updatedUser.user.email,\n                email_confirmed_at: updatedUser.user.email_confirmed_at\n            }\n        });\n    } catch (error) {\n        console.error('API error:', error);\n        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: `Server error: ${errorMessage}`\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FkbWluL2NvbmZpcm0tZW1haWwvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQW9EO0FBQ1Y7QUFFMUMsNENBQTRDO0FBQzVDLE1BQU1FLGNBQWNDLDBDQUFvQztBQUN4RCxNQUFNRyxpQkFBaUJILFFBQVFDLEdBQUcsQ0FBQ0cseUJBQXlCO0FBRTVELElBQUksQ0FBQ0wsZUFBZSxDQUFDSSxnQkFBZ0I7SUFDbkMsTUFBTSxJQUFJRSxNQUFNO0FBQ2xCO0FBRUEsTUFBTUMsZ0JBQWdCVCxtRUFBWUEsQ0FDaENFLGFBQ0FJLGdCQUNBO0lBQ0VJLE1BQU07UUFDSkMsa0JBQWtCO1FBQ2xCQyxnQkFBZ0I7SUFDbEI7QUFDRjtBQUdLLGVBQWVDLEtBQUtDLE9BQWdCO0lBQ3pDLElBQUk7UUFDRixNQUFNLEVBQUVDLEtBQUssRUFBRSxHQUFHLE1BQU1ELFFBQVFFLElBQUk7UUFFcEMsSUFBSSxDQUFDRCxPQUFPO1lBQ1YsT0FBT2QscURBQVlBLENBQUNlLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBb0IsR0FDN0I7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLHdCQUF3QjtRQUN4QixNQUFNLEVBQUVDLE1BQU1DLEtBQUssRUFBRUgsT0FBT0ksU0FBUyxFQUFFLEdBQUcsTUFBTVosY0FBY0MsSUFBSSxDQUFDWSxLQUFLLENBQUNDLFNBQVM7UUFFbEYsSUFBSUYsV0FBVztZQUNiRyxRQUFRUCxLQUFLLENBQUMsd0JBQXdCSTtZQUN0QyxPQUFPcEIscURBQVlBLENBQUNlLElBQUksQ0FDdEI7Z0JBQUVDLE9BQU87WUFBc0IsR0FDL0I7Z0JBQUVDLFFBQVE7WUFBSTtRQUVsQjtRQUVBLE1BQU1PLE9BQU9MLE1BQU1BLEtBQUssQ0FBQ00sSUFBSSxDQUFDQyxDQUFBQSxJQUFLQSxFQUFFWixLQUFLLEtBQUtBO1FBRS9DLElBQUksQ0FBQ1UsTUFBTTtZQUNULE9BQU94QixxREFBWUEsQ0FBQ2UsSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUFpQixHQUMxQjtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsMERBQTBEO1FBQzFELE1BQU0sRUFBRUMsTUFBTVMsT0FBTyxFQUFFLEdBQUcsTUFBTW5CLGNBQzdCb0IsSUFBSSxDQUFDLHNCQUNMQyxNQUFNLENBQUMsdUNBQ1BDLEVBQUUsQ0FBQyxXQUFXTixLQUFLTyxFQUFFLEVBQ3JCQyxNQUFNO1FBRVQsdURBQXVEO1FBQ3ZELE1BQU0sRUFBRWQsTUFBTWUsV0FBVyxFQUFFakIsT0FBT2tCLFdBQVcsRUFBRSxHQUFHLE1BQU0xQixjQUFjQyxJQUFJLENBQUNZLEtBQUssQ0FBQ2MsY0FBYyxDQUM3RlgsS0FBS08sRUFBRSxFQUNQO1lBQ0VLLGVBQWU7WUFDZkMsZUFBZTtnQkFDYixHQUFHYixLQUFLYSxhQUFhO2dCQUNyQkMsaUJBQWlCWCxTQUFTVztnQkFDMUJDLFNBQVNaLFNBQVNZO2dCQUNsQkMsV0FBV2IsU0FBU2EsYUFBYTtZQUNuQztRQUNGO1FBR0YsSUFBSU4sYUFBYTtZQUNmWCxRQUFRUCxLQUFLLENBQUMsMkJBQTJCa0I7WUFDekMsT0FBT2xDLHFEQUFZQSxDQUFDZSxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPLENBQUMseUJBQXlCLEVBQUVrQixZQUFZTyxPQUFPLEVBQUU7WUFBQyxHQUMzRDtnQkFBRXhCLFFBQVE7WUFBSTtRQUVsQjtRQUVBLE9BQU9qQixxREFBWUEsQ0FBQ2UsSUFBSSxDQUFDO1lBQ3ZCMkIsU0FBUztZQUNURCxTQUFTLENBQUMsb0JBQW9CLEVBQUUzQixPQUFPO1lBQ3ZDVSxNQUFNO2dCQUNKTyxJQUFJRSxZQUFZVCxJQUFJLENBQUNPLEVBQUU7Z0JBQ3ZCakIsT0FBT21CLFlBQVlULElBQUksQ0FBQ1YsS0FBSztnQkFDN0I2QixvQkFBb0JWLFlBQVlULElBQUksQ0FBQ21CLGtCQUFrQjtZQUN6RDtRQUNGO0lBRUYsRUFBRSxPQUFPM0IsT0FBTztRQUNkTyxRQUFRUCxLQUFLLENBQUMsY0FBY0E7UUFDNUIsTUFBTTRCLGVBQWU1QixpQkFBaUJULFFBQVFTLE1BQU15QixPQUFPLEdBQUc7UUFDOUQsT0FBT3pDLHFEQUFZQSxDQUFDZSxJQUFJLENBQ3RCO1lBQUVDLE9BQU8sQ0FBQyxjQUFjLEVBQUU0QixjQUFjO1FBQUMsR0FDekM7WUFBRTNCLFFBQVE7UUFBSTtJQUVsQjtBQUNGIiwic291cmNlcyI6WyIvVXNlcnMvbnFvZS9Eb3dubG9hZHMvY29hbC1hcHAvYXBwL2FwaS9hZG1pbi9jb25maXJtLWVtYWlsL3JvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcbmltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gJ25leHQvc2VydmVyJ1xuXG4vLyBDcmVhdGUgYWRtaW4gY2xpZW50IHdpdGggc2VydmljZSByb2xlIGtleVxuY29uc3Qgc3VwYWJhc2VVcmwgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkxcbmNvbnN0IHNlcnZpY2VSb2xlS2V5ID0gcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWVxuXG5pZiAoIXN1cGFiYXNlVXJsIHx8ICFzZXJ2aWNlUm9sZUtleSkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgU3VwYWJhc2UgZW52aXJvbm1lbnQgdmFyaWFibGVzJylcbn1cblxuY29uc3Qgc3VwYWJhc2VBZG1pbiA9IGNyZWF0ZUNsaWVudChcbiAgc3VwYWJhc2VVcmwsXG4gIHNlcnZpY2VSb2xlS2V5LFxuICB7XG4gICAgYXV0aDoge1xuICAgICAgYXV0b1JlZnJlc2hUb2tlbjogZmFsc2UsXG4gICAgICBwZXJzaXN0U2Vzc2lvbjogZmFsc2VcbiAgICB9XG4gIH1cbilcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdDogUmVxdWVzdCkge1xuICB0cnkge1xuICAgIGNvbnN0IHsgZW1haWwgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpXG5cbiAgICBpZiAoIWVtYWlsKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6ICdFbWFpbCBpcyByZXF1aXJlZCcgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSB1c2VyIGJ5IGVtYWlsXG4gICAgY29uc3QgeyBkYXRhOiB1c2VycywgZXJyb3I6IGxpc3RFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VBZG1pbi5hdXRoLmFkbWluLmxpc3RVc2VycygpXG4gICAgXG4gICAgaWYgKGxpc3RFcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbGlzdGluZyB1c2VyczonLCBsaXN0RXJyb3IpXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6ICdGYWlsZWQgdG8gZmluZCB1c2VyJyB9LFxuICAgICAgICB7IHN0YXR1czogNTAwIH1cbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCB1c2VyID0gdXNlcnMudXNlcnMuZmluZCh1ID0+IHUuZW1haWwgPT09IGVtYWlsKVxuICAgIFxuICAgIGlmICghdXNlcikge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnVXNlciBub3QgZm91bmQnIH0sXG4gICAgICAgIHsgc3RhdHVzOiA0MDQgfVxuICAgICAgKVxuICAgIH1cblxuICAgIC8vIEdldCB0aGUgdXNlcidzIG9yZ2FuaXphdGlvbiBkYXRhIHRvIHNldCBwcm9wZXIgbWV0YWRhdGFcbiAgICBjb25zdCB7IGRhdGE6IG9yZ1VzZXIgfSA9IGF3YWl0IHN1cGFiYXNlQWRtaW5cbiAgICAgIC5mcm9tKCdvcmdhbml6YXRpb25fdXNlcnMnKVxuICAgICAgLnNlbGVjdCgnb3JnYW5pemF0aW9uX2lkLCByb2xlX2lkLCBpc19hY3RpdmUnKVxuICAgICAgLmVxKCd1c2VyX2lkJywgdXNlci5pZClcbiAgICAgIC5zaW5nbGUoKVxuXG4gICAgLy8gVXBkYXRlIHVzZXIgdG8gY29uZmlybSBlbWFpbCBhbmQgc2V0IHByb3BlciBtZXRhZGF0YVxuICAgIGNvbnN0IHsgZGF0YTogdXBkYXRlZFVzZXIsIGVycm9yOiB1cGRhdGVFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VBZG1pbi5hdXRoLmFkbWluLnVwZGF0ZVVzZXJCeUlkKFxuICAgICAgdXNlci5pZCxcbiAgICAgIHsgXG4gICAgICAgIGVtYWlsX2NvbmZpcm06IHRydWUsXG4gICAgICAgIHVzZXJfbWV0YWRhdGE6IHtcbiAgICAgICAgICAuLi51c2VyLnVzZXJfbWV0YWRhdGEsXG4gICAgICAgICAgb3JnYW5pemF0aW9uX2lkOiBvcmdVc2VyPy5vcmdhbml6YXRpb25faWQsXG4gICAgICAgICAgcm9sZV9pZDogb3JnVXNlcj8ucm9sZV9pZCxcbiAgICAgICAgICBpc19hY3RpdmU6IG9yZ1VzZXI/LmlzX2FjdGl2ZSB8fCB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApXG5cbiAgICBpZiAodXBkYXRlRXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNvbmZpcm1pbmcgZW1haWw6JywgdXBkYXRlRXJyb3IpXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6IGBGYWlsZWQgdG8gY29uZmlybSBlbWFpbDogJHt1cGRhdGVFcnJvci5tZXNzYWdlfWAgfSxcbiAgICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBtZXNzYWdlOiBgRW1haWwgY29uZmlybWVkIGZvciAke2VtYWlsfWAsXG4gICAgICB1c2VyOiB7XG4gICAgICAgIGlkOiB1cGRhdGVkVXNlci51c2VyLmlkLFxuICAgICAgICBlbWFpbDogdXBkYXRlZFVzZXIudXNlci5lbWFpbCxcbiAgICAgICAgZW1haWxfY29uZmlybWVkX2F0OiB1cGRhdGVkVXNlci51c2VyLmVtYWlsX2NvbmZpcm1lZF9hdFxuICAgICAgfVxuICAgIH0pXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdBUEkgZXJyb3I6JywgZXJyb3IpXG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvciBvY2N1cnJlZCdcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICB7IGVycm9yOiBgU2VydmVyIGVycm9yOiAke2Vycm9yTWVzc2FnZX1gIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApXG4gIH1cbn0gIl0sIm5hbWVzIjpbImNyZWF0ZUNsaWVudCIsIk5leHRSZXNwb25zZSIsInN1cGFiYXNlVXJsIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsInNlcnZpY2VSb2xlS2V5IiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsIkVycm9yIiwic3VwYWJhc2VBZG1pbiIsImF1dGgiLCJhdXRvUmVmcmVzaFRva2VuIiwicGVyc2lzdFNlc3Npb24iLCJQT1NUIiwicmVxdWVzdCIsImVtYWlsIiwianNvbiIsImVycm9yIiwic3RhdHVzIiwiZGF0YSIsInVzZXJzIiwibGlzdEVycm9yIiwiYWRtaW4iLCJsaXN0VXNlcnMiLCJjb25zb2xlIiwidXNlciIsImZpbmQiLCJ1Iiwib3JnVXNlciIsImZyb20iLCJzZWxlY3QiLCJlcSIsImlkIiwic2luZ2xlIiwidXBkYXRlZFVzZXIiLCJ1cGRhdGVFcnJvciIsInVwZGF0ZVVzZXJCeUlkIiwiZW1haWxfY29uZmlybSIsInVzZXJfbWV0YWRhdGEiLCJvcmdhbml6YXRpb25faWQiLCJyb2xlX2lkIiwiaXNfYWN0aXZlIiwibWVzc2FnZSIsInN1Y2Nlc3MiLCJlbWFpbF9jb25maXJtZWRfYXQiLCJlcnJvck1lc3NhZ2UiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admin/confirm-email/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Fconfirm-email%2Froute&page=%2Fapi%2Fadmin%2Fconfirm-email%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fconfirm-email%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Fconfirm-email%2Froute&page=%2Fapi%2Fadmin%2Fconfirm-email%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fconfirm-email%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _Users_nqoe_Downloads_coal_app_app_api_admin_confirm_email_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admin/confirm-email/route.ts */ \"(rsc)/./app/api/admin/confirm-email/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admin/confirm-email/route\",\n        pathname: \"/api/admin/confirm-email\",\n        filename: \"route\",\n        bundlePath: \"app/api/admin/confirm-email/route\"\n    },\n    resolvedPagePath: \"/Users/nqoe/Downloads/coal-app/app/api/admin/confirm-email/route.ts\",\n    nextConfigOutput,\n    userland: _Users_nqoe_Downloads_coal_app_app_api_admin_confirm_email_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbiUyRmNvbmZpcm0tZW1haWwlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFkbWluJTJGY29uZmlybS1lbWFpbCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFkbWluJTJGY29uZmlybS1lbWFpbCUyRnJvdXRlLnRzJmFwcERpcj0lMkZVc2VycyUyRm5xb2UlMkZEb3dubG9hZHMlMkZjb2FsLWFwcCUyRmFwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9JTJGVXNlcnMlMkZucW9lJTJGRG93bmxvYWRzJTJGY29hbC1hcHAmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQStGO0FBQ3ZDO0FBQ3FCO0FBQ21CO0FBQ2hHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix5R0FBbUI7QUFDM0M7QUFDQSxjQUFjLGtFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsc0RBQXNEO0FBQzlEO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzBGOztBQUUxRiIsInNvdXJjZXMiOlsiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLWtpbmRcIjtcbmltcG9ydCB7IHBhdGNoRmV0Y2ggYXMgX3BhdGNoRmV0Y2ggfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9saWIvcGF0Y2gtZmV0Y2hcIjtcbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIvVXNlcnMvbnFvZS9Eb3dubG9hZHMvY29hbC1hcHAvYXBwL2FwaS9hZG1pbi9jb25maXJtLWVtYWlsL3JvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hZG1pbi9jb25maXJtLWVtYWlsL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYWRtaW4vY29uZmlybS1lbWFpbFwiLFxuICAgICAgICBmaWxlbmFtZTogXCJyb3V0ZVwiLFxuICAgICAgICBidW5kbGVQYXRoOiBcImFwcC9hcGkvYWRtaW4vY29uZmlybS1lbWFpbC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIi9Vc2Vycy9ucW9lL0Rvd25sb2Fkcy9jb2FsLWFwcC9hcHAvYXBpL2FkbWluL2NvbmZpcm0tZW1haWwvcm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Fconfirm-email%2Froute&page=%2Fapi%2Fadmin%2Fconfirm-email%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fconfirm-email%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/ws","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmin%2Fconfirm-email%2Froute&page=%2Fapi%2Fadmin%2Fconfirm-email%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fconfirm-email%2Froute.ts&appDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app%2Fapp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=%2FUsers%2Fnqoe%2FDownloads%2Fcoal-app&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();