# Mission 004 — Cứu AtoEnglish: học miễn phí từ đầu tới B2/C1

Ngày: 2026-10-06 (Asia/Ho_Chi_Minh).
Owner: Hoàng. Repo app: Thunderkill016/atoenglish. Repo nội dung: Thunderkill016/atoenglish-content.
Quyết định hiện tại: web cá nhân miễn phí để nghe, nói, đọc, viết và giao tiếp tự nhiên. B2 vững là mốc chính; C1/khả năng gần IELTS 7.0 là mốc tiếp. Thay hướng IELTS-first 0→9.0; không mở chương trình song song.

## 1. Kết quả bắt buộc

Bàn giao **bản chạy có một bài học hoàn chỉnh**, một bản đồ chương trình từ đầu tới B2/C1, kiểm thử browser và danh sách hạn chế. Chỉ có báo cáo, registry, YAML hoặc landing mới thì chưa hoàn thành.

Owner đã ủy quyền thực hiện các lựa chọn thường lệ trong phạm vi này. Devin tự chọn nguồn phù hợp, soạn bài và tích hợp; không dừng chờ Hoàng điền blueprint/chọn từng nguồn. Những thay đổi hủy dữ liệu, merge/deploy production vẫn theo AGENTS.md. Đây là task hữu hạn, không bật lại autopilot/backlog daemon.

## 2. Bắt đầu từ hệ thống đang có

Đọc PROJECT_STATE, SOURCE_OF_TRUTH, AGENTS và Plate Control Tower. Kiểm tra exact main, PR đang mở và công việc chưa xong để tránh ghi đè agent khác.

Đi một lượt learner flow hiện tại: vào app → tìm bài → nghe/đọc → trả lời → giải thích/sửa → nói/viết → kết thúc → mở lại → ôn.
Ghi URL/route, hành vi quan sát, lỗi, file liên quan và quyết định reuse/fix/freeze. Phân biệt kiểm tra local/preview/production; không nói đã xác minh production khi chưa làm.

Giữ Cloudflare Workers/Neon và player hiện có. Chỉ sửa những phần chặn bài pilot. Không viết lại app, chuyển stack, làm lại toàn bộ design system hoặc xóa dữ liệu tiến độ cũ.

## 3. Một chương trình, toàn bộ đích đến

Bản đồ trong app phải có Pre-A1, A1, A2, B1, B2, C1. Mỗi chặng mô tả:
- outcome nghe/nói/đọc/viết và tương tác;
- nhóm tình huống/chủ đề, chức năng giao tiếp, grammar/vocabulary/pronunciation hỗ trợ;
- nguồn thích hợp, cách luyện, cách kiểm tra bằng bài mới và điều kiện tiến bước;
- trạng thái bài: học được / đang làm / kế hoạch; không đưa nút học giả.

Không cố định số bài hoặc hứa đạt C1 sau X ngày. Không khóa người học vào level tổng khi từng kỹ năng khác nhau.

**Chuỗi Foundation đầu tiên (kế hoạch để author, không tự nhận hoàn thiện):**
1. Chào và nói tên mình.
2. Hỏi tên, giới thiệu người khác, kết thúc lịch sự.
3. Đánh vần tên và xin nhắc lại.
4. Nghe/nói số và cung cấp thông tin liên hệ.
5. Nói nơi ở và xuất thân.
6. Nói nghề và hoạt động hằng ngày.
7. Hỏi/nói giờ, sắp xếp cuộc hẹn đơn giản.
8. Yêu cầu đồ ăn/uống và trả lời lựa chọn.
9. Hỏi giá, số lượng và thanh toán.
10. Hỏi vị trí và hiểu chỉ đường ngắn.
11. Nói gia đình/sở thích, hỏi thêm về người kia.
12. Tích hợp vào tình huống mới và kiểm tra lại sau khoảng nghỉ.

Đây là chuỗi dạy đề xuất; không coi thứ tự dạy là dependency thật. Bài 1 không yêu cầu người mới nói số điện thoại, đánh vần hay độc thoại dài trước khi được học.

Các chặng sau phải bao quát: sinh hoạt/đi lại, câu chuyện/trải nghiệm, quan hệ xã hội, công việc thường ngày, thông tin/truyền thông, giải thích/so sánh/quan điểm và xử lý hiểu nhầm. Đánh giá bốn kỹ năng riêng và thêm tương tác thực tế.

## 4. Nguồn và miễn phí

Dùng CEFR Companion Volume làm reference outcome; nó không phải giáo trình sẵn.
Đầu mối đã tìm thấy, cần mở từng lesson và đối chiếu trước khi dùng:
- https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors
- https://learnenglish.britishcouncil.org/
- https://learnenglish.britishcouncil.org/free-resources/listening
- https://learnenglish.britishcouncil.org/free-resources/speaking
- https://learnenglish.britishcouncil.org/getting-started
- https://www.ielts.org/organisations/ielts-for-organisations/compare-ielts/ielts-and-the-cefr

Đây là đầu mối, chưa phải bộ tài liệu đã nhập. Tìm thêm nguồn Pre-A1 khi nguồn A1 vẫn quá khó. Không giới hạn vào VOA, không dùng tin tức chỉ vì có transcript.

Chọn một nguồn ngắn cho bài 1 theo outcome và độ khó thực tế. Ghi publisher, URL lesson, loại asset, đoạn/câu/time range được dùng, ngày truy cập, adaptation và trạng thái sử dụng (link/embed/local copy/unknown). Miễn phí truy cập không tự động có nghĩa được phân phối lại. Dùng link/embed hoặc nguồn cho phép nếu chưa rõ; không bypass paywall.
Ví dụ/bài luyện tự soạn phải ghi rõ authored, không gắn nhãn câu gốc.

Core flow không cần paid API, thuê bao AI hay dịch vụ chấm nói tính phí. Lập bảng feature → giải pháp miễn phí → fallback → giới hạn. Báo rõ quota hosting/storage, không hứa free vô hạn. AI là tùy chọn; mất key/không có speech recognition vẫn học xong được.

## 5. Pilot bắt buộc: Chào và nói tên mình

Can-do: nghe lời chào/câu hỏi tên đơn giản và tham gia trao đổi tên ngắn với người mới.
Mục tiêu thực hành do dự án đề xuất, không phải chứng nhận CEFR.

- DẪN: hướng dẫn tiếng Việt, mục tiêu ngắn, nút bắt đầu. Cho người mới bắt đầu trực tiếp; kiểm tra đầu vào là tùy chọn.
- MẪU: hội thoại ngắn, audio chạy được, nghe lại/chậm hơn, transcript và giải nghĩa có thể mở; chỉ ra hello/hi, my name is/I am, what is your name.
- DÙNG: nghe hiểu rồi hoàn thành câu/trao đổi có trợ giúp. Feedback giải thích tiếng Việt, sai thì gợi ý và thử lại.
- CHỨNG MINH: nghe đoạn mới; đọc đoạn giới thiệu ngắn; viết lời giới thiệu 1–2 câu; nói lời chào/tên rồi trả lời lượt hỏi. Không bắt độc thoại 30–60 giây ở bài đầu.
- GIỮ: ôn mẫu quan trọng và đặt lần nhắc lại sau khoảng nghỉ; lưu artifact và lỗi. Hiện rõ phần nào đã làm, có trợ giúp, hay cần luyện thêm.

Thay tên/người nói/bối cảnh ở bài mới; không chỉ lặp lại đáp án đã thấy.
Audio không được TBD, phát im lặng hoặc hỏng link. Ưu tiên audio gốc thích hợp; TTS bổ sung phải ghi đúng loại và nghe kiểm tra trước.
Speaking tối thiểu có ghi âm → nghe lại → đối chiếu mẫu/rubric. Khi microphone bị từ chối/không hỗ trợ, cho cách tiếp tục và ghi rõ chưa thu được bằng chứng nói.
Không coi transcript ASR giống mẫu là phát âm đúng. Chưa có evaluator đáng tin thì ghi tự đánh giá/chưa chấm; không bịa điểm hay pass.
Không đánh giá viết tự do bằng exact match duy nhất. Câu mẫu chỉ xuất hiện sau lượt làm độc lập.

## 6. Ôn và đánh giá

Coverage theo thứ tự bài chỉ là introduced-language coverage; không đặt tên learner known/mastered.
Ghi riêng: đã gặp, làm có gợi ý, làm độc lập, kết quả ôn sau khoảng nghỉ; dùng model/evidence hiện có khi phù hợp.
Một lần hoàn thành không nâng CEFR/IELTS band. Dùng task mới, che mẫu và ghi support đã dùng.
Bài ôn phục hồi lỗi trước khi mở rộng. Miss review không xóa lịch sử thành công hay tạo mastery giả.
Luyện hội thoại trong web là rehearsal. Bản đồ B1/B2 phải có nhiệm vụ với người thật, cách chuẩn bị và reflection; chưa có live-interaction evidence thì báo đúng hạn chế.

## 7. Verification và bàn giao

Kiểm tra trên mobile 390px và desktop:
- học hết bài, audio/transcript, câu đúng/sai, retry và feedback;
- nói/ghi âm/nghe lại; từ chối mic; không có paid AI key;
- viết, model answer sau nộp, refresh/resume, ôn khi tới hạn;
- lỗi mạng/audio có thông báo và retry; không mất artifact;
- keyboard, label, focus và trạng thái loading/error.

Chạy typecheck/lint/content validation và tests phù hợp phạm vi sửa; ít nhất một browser flow end-to-end và nhánh sai/permission failure. Không mass-test/refactor để mở rộng scope.
Bàn giao: URL bản chạy hoặc local run instructions nếu preview bị chặn; branch/commit/PR; nguồn bài 1; ảnh mobile/desktop; test thật đã chạy; hạn chế chấm nói/viết và chi phí/quota.
Không ghi “đã deploy” khi chỉ có preview. Production theo exact-head release rule của repo.

## 8. Done / chưa Done

Done khi bản đồ hiện đúng trạng thái và Hoàng có thể học trọn bài 1 miễn phí, nhận giải thích, luyện nghe/nói/đọc/viết, lưu và quay lại ôn.
Chất lượng học tập chưa được chứng minh cho tới khi có học thử thật; ghi nhận feedback của Hoàng trước khi mở rộng hàng loạt.
Không cần nhập toàn bộ internet, hoàn thiện 500 từ, hoàn thiện graph/evaluator phổ quát hay redesign landing trước khi giao pilot.
