# Ghi chú nghiên cứu — gói `research/ejoy-2026-10-06`

Ngày 2026-10-06. Nguồn: nhánh `research/ejoy-archive-2026-10-06` (commit `aa2d6678`), file `research-support.zip` ghép từ 9 phần. Gói gồm: báo cáo sản phẩm eJOY (`ejoy-product-research/bao-cao-ejoy.md`), nghiên cứu tĩnh 39 repo mã nguồn mở cùng loại (`github-research/BAO-CAO.md`, `DANH-MUC-REPO.md`, `SCOPE.md`) và hồ sơ Trancy (`github-research/TRANCY.md`).

## Giới hạn bằng chứng (báo cáo tự ghi)

- Nghiên cứu **tĩnh**: không cài, không build, không chạy repo nào; ~28.000 blob / ~1,89 GB được lập chỉ mục, nhưng chỉ một phần được đọc thủ công.
- Chưa đo hiệu quả học, độ chính xác chấm phát âm, chi phí vận hành hay mức giữ chân người dùng.
- Vì vậy gói này là **bằng chứng để thiết kế** (mức "market/product evidence" trong `SOURCE_OF_TRUTH.md`), không phải bằng chứng học tập của AtoEnglish và không phải bản thiết kế hệ thống.

## Kết luận dùng cho thiết kế

1. Không repo nào thay được eJOY trọn vẹn; mỗi dự án chỉ làm một đoạn của hành trình (khai thác câu từ video, đọc có tra từ, ôn thẻ, luyện nói).
2. Mô hình dữ liệu nên tách năm đối tượng: **nguồn nội dung → câu + timestamp → cụm từ kèm ngữ cảnh → thẻ + lịch ôn → kết quả từng lần luyện**. Scheduler chỉ nhận kết quả luyện; AI/tutor đọc dữ liệu học qua một lớp API, không ghi thẳng vào lịch.
3. Một từ gặp ở nhiều ngữ cảnh phải giữ được từng ngữ cảnh (Zeeguu: `UserWord` một dòng/từ/người học mang lịch ôn; `Bookmark` một dòng/lần gặp, trỏ tới nguồn, câu, vị trí token, cờ cụm nhiều từ).
4. Lấy phụ đề YouTube phía server: echo-type mô tả chuỗi player client iOS → Android → caption track trong trang watch → `/api/timedtext?type=list`, định dạng `json3`, ngân sách 6 request/lần, backoff 300/600/1200 ms khi 403/429/5xx, lỗi trả về ổn định (400/404/500) không lộ nội dung upstream. Đây là **mô tả trong tài liệu thiết kế của repo đó**, chưa được AtoEnglish chạy thử.
5. Extension (easysubs, asbplayer) chỉ bắt URL `/api/timedtext` mà trình duyệt của người dùng đã gọi; cách này không áp dụng được cho web thuần, nên đã loại (quyết định chủ dự án 06/10).
6. Chấm phát âm: Cadence (Wav2Vec2 + IPA) cho điểm theo quy ước match/mismatch, english-trainer khi không có Azure chỉ so transcript. Kết luận: web miễn phí chỉ nên **so độ khớp transcript** và phải ghi rõ đó không phải chấm phát âm.
7. Lịch ôn: echo-type dùng `ts-fsrs` (như AtoEnglish); openlingo dùng SM-2; LinguaCafe dùng quy tắc riêng — không gọi là SRS chuẩn nếu không phải.
8. Trancy (đối thủ thương mại): phụ đề song ngữ, Wordbook, câu đã lưu, Learning Center, Flashcard, AI Shadowing, AITalk, chấm phát âm, quota Free/Premium. Tham khảo phạm vi tính năng; không có mã nguồn để xác minh.

## Giấy phép cần nhớ khi tham khảo mã

| Repo                                                         | Giấy phép                        | Dùng thế nào                                                      |
| ------------------------------------------------------------ | -------------------------------- | ----------------------------------------------------------------- |
| asbplayer                                                    | AGPL-3.0-or-later (một phần MIT) | Chỉ tham khảo ý tưởng; không sao chép mã vào repo MIT/proprietary |
| easysubs, echo-type, openlingo, zeeguu/api, lute-v3, Cadence | MIT                              | Có thể tham khảo mã; ghi nguồn khi mượn đoạn                      |
| vocabsieve, LinguaCafe, aprelendo, mpvacious                 | GPL-3.0                          | Chỉ tham khảo ý tưởng                                             |
| zeeguu/web, word-hunter                                      | Chưa xác nhận                    | Không mượn mã                                                     |

## Những gì không lấy từ báo cáo

- Không lấy quota Free/Premium, AITalk, league/XP hay cơ chế gắn kết nào — nằm trong phạm vi đã đóng của `PROJECT_STATE.md`.
- Không coi điểm phát âm, điểm AI hay số thẻ đã lưu là bằng chứng năng lực.
