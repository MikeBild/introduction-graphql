"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.byId = exports.list = void 0;
async function list() {
    return [{ id: 1, content: 'ABC' }];
}
exports.list = list;
async function byId(payload) {
    console.log(payload);
    return { id: 1, content: 'ABC' };
}
exports.byId = byId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJ0aWNsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcnRpY2xlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBTyxLQUFLLFVBQVUsSUFBSTtJQUN4QixPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFGRCxvQkFFQztBQUVNLEtBQUssVUFBVSxJQUFJLENBQUMsT0FBWTtJQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JCLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNuQyxDQUFDO0FBSEQsb0JBR0MiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgYXN5bmMgZnVuY3Rpb24gbGlzdCgpIHtcbiAgcmV0dXJuIFt7IGlkOiAxLCBjb250ZW50OiAnQUJDJyB9XTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJ5SWQocGF5bG9hZDogYW55KSB7XG4gIGNvbnNvbGUubG9nKHBheWxvYWQpO1xuICByZXR1cm4geyBpZDogMSwgY29udGVudDogJ0FCQycgfTtcbn1cbiJdfQ==