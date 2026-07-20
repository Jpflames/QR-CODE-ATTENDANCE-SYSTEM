import mongoose from "mongoose";

try {
  const id1 = "cjb234sdfs23"; // 12 chars - string?
  const id2 = "cjb234sdfs23cjb234sdfs23"; // 24 chars - non-hex
  const id3 = "64abc1234567890123456789"; // 24 chars - hex

  console.log("12 chars:", new mongoose.Types.ObjectId(id1).toString());
  console.log("24 hex:", new mongoose.Types.ObjectId(id3).toString());
  console.log("24 non-hex:", new mongoose.Types.ObjectId(id2).toString());
} catch (e) {
  console.error("Error:", e.message);
}
