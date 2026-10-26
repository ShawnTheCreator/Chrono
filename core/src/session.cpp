#include "chrono/session.h"
#include <fstream>
#include <sstream>

namespace chrono {

Session::Session(SessionMetadata meta, const std::string& output_dir)
    : meta_(std::move(meta)), output_dir_(output_dir) {
    if (meta_.session_id.empty()) {
        meta_.session_id = "ses_" + std::to_string(Event::now_monotonic_ns()).substr(0, 12);
    }
    log_filepath_ = output_dir_ + "/" + meta_.session_id + ".chrono";
    index_filepath_ = output_dir_ + "/" + meta_.session_id + ".chronoi";

    // Genesis hash generated from session id
    auto genesis_hash = crypto::SHA256::hash(meta_.session_id);
    writer_ = std::make_unique<HashChainWriter>(log_filepath_, genesis_hash);

    // Initial session start event
    Event start_ev;
    start_ev.kind = EventKind::SESSION_START;
    start_ev.timestamp_ns = 0;
    start_ev.payload = meta_json();
    record(start_ev);
}

Session::~Session() {
    close();
}

void Session::record(Event event) {
    if (is_closed_) return;

    // Track telemetry & stalls
    telemetry_.record_event(event);
    if (auto alert = stall_detector_.process_event(event)) {
        // Emit stall alert event into the log chain
        Event alert_ev;
        alert_ev.kind = EventKind::STALL_ALERT;
        alert_ev.timestamp_ns = event.timestamp_ns;
        alert_ev.payload = alert->to_json();
        auto alert_rec = writer_->append(alert_ev);

        IndexEntry entry;
        entry.timestamp_ns = alert_ev.timestamp_ns;
        entry.seq_id = alert_rec.header.seq_id;
        entry.file_offset = current_file_offset_;
        entry.kind = static_cast<uint16_t>(alert_ev.kind);
        entry.flags = 0x02; // Flag stall
        index_.add_entry(entry);
        current_file_offset_ += alert_rec.header.total_length;
    }

    auto rec = writer_->append(event);

    IndexEntry entry;
    entry.timestamp_ns = event.timestamp_ns;
    entry.seq_id = rec.header.seq_id;
    entry.file_offset = current_file_offset_;
    entry.kind = static_cast<uint16_t>(event.kind);
    entry.flags = (event.kind == EventKind::CHECKPOINT) ? 0x01 : 0x00;
    index_.add_entry(entry);

    current_file_offset_ += rec.header.total_length;
}

void Session::register_checkpoint(Checkpoint cp) {
    checkpoints_.register_checkpoint(cp);

    Event ev;
    ev.kind = EventKind::CHECKPOINT;
    ev.timestamp_ns = cp.timestamp_ns;
    ev.flags = 0x01;
    ev.payload = cp.to_json();
    record(ev);
}

void Session::flush() {
    if (writer_) writer_->flush();
    index_.save_to_file(index_filepath_);
}

void Session::close() {
    if (!is_closed_) {
        Event end_ev;
        end_ev.kind = EventKind::SESSION_END;
        end_ev.timestamp_ns = Event::now_monotonic_ns();
        end_ev.payload = "{\"status\": \"completed\"}";
        record(end_ev);

        if (writer_) {
            writer_->close();
        }
        index_.save_to_file(index_filepath_);
        is_closed_ = true;
    }
}

std::string Session::meta_json() const {
    std::ostringstream ss;
    ss << "{\n"
       << "  \"session_id\": \"" << meta_.session_id << "\",\n"
       << "  \"task_name\": \"" << meta_.task_name << "\",\n"
       << "  \"model\": \"" << meta_.model << "\",\n"
       << "  \"agent_framework\": \"" << meta_.agent_framework << "\",\n"
       << "  \"workspace_path\": \"" << meta_.workspace_path << "\",\n"
       << "  \"git_branch\": \"" << meta_.git_branch << "\"\n"
       << "}";
    return ss.str();
}

} // namespace chrono
