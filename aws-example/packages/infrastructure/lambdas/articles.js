"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.byId = exports.list = void 0;
async function list(payload) {
    console.log(payload);
    return [{ id: 1, body: 'ABC' }];
}
exports.list = list;
async function byId(payload) {
    console.log(payload);
    return { id: 1, body: 'ABC' };
}
exports.byId = byId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJ0aWNsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcnRpY2xlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxLQUFLLFVBQVUsSUFBSSxDQUFDLE9BQVk7SUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyQixPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFIRCxvQkFHQztBQUVNLEtBQUssVUFBVSxJQUFJLENBQUMsT0FBWTtJQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JCLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNoQyxDQUFDO0FBSEQsb0JBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgYXN5bmMgZnVuY3Rpb24gbGlzdChwYXlsb2FkOiBhbnkpIHtcbiAgY29uc29sZS5sb2cocGF5bG9hZCk7XG4gIHJldHVybiBbeyBpZDogMSwgYm9keTogJ0FCQycgfV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBieUlkKHBheWxvYWQ6IGFueSkge1xuICBjb25zb2xlLmxvZyhwYXlsb2FkKTtcbiAgcmV0dXJuIHsgaWQ6IDEsIGJvZHk6ICdBQkMnIH07XG59XG4iXX0=