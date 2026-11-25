// Generated from the merged pull request diffs (`gh pr diff`). Excerpts only.

export type DiffLine = { t: " " | "+" | "-"; o?: number; n?: number; s: string };
export type DiffFile = { path: string; hunks: { context: string; lines: DiffLine[] }[] };

export const diffs: Record<string, DiffFile[]> = {
 "8106": [
  {
   "path": "app/models/grouping.rb",
   "hunks": [
    {
     "context": "def invite(members,",
     "lines": [
      {
       "t": " ",
       "o": 317,
       "n": 317,
       "s": "    # overloading invite() to accept members arg as both a string and a array"
      },
      {
       "t": " ",
       "o": 318,
       "n": 318,
       "s": "    members = [members] unless members.instance_of?(Array) # put a string in an array"
      },
      {
       "t": " ",
       "o": 319,
       "n": 319,
       "s": "    all_errors = []"
      },
      {
       "t": "+",
       "n": 320,
       "s": "    already_invited = Set.new"
      },
      {
       "t": "+",
       "n": 321,
       "s": "    if members.empty?"
      },
      {
       "t": "+",
       "n": 322,
       "s": "      return [[I18n.t('groups.invite_member.errors.empty_text_field')], already_invited]"
      },
      {
       "t": "+",
       "n": 323,
       "s": "    end"
      },
      {
       "t": " ",
       "o": 320,
       "n": 324,
       "s": "    members.each do |m|"
      },
      {
       "t": " ",
       "o": 321,
       "n": 325,
       "s": "      m = m.strip"
      },
      {
       "t": "-",
       "o": 322,
       "s": "      user = course.students.joins(:user).find_by('users.user_name': m)"
      },
      {
       "t": "+",
       "n": 326,
       "s": "      user_name = false"
      },
      {
       "t": "+",
       "n": 327,
       "s": "      if m.include?('@') # email"
      },
      {
       "t": "+",
       "n": 328,
       "s": "        user = course.students.joins(:user).find_by('lower(users.email) = ?', m.downcase)"
      },
      {
       "t": "+",
       "n": 329,
       "s": "      else"
      },
      {
       "t": "+",
       "n": 330,
       "s": "        user = course.students.joins(:user).find_by('users.user_name': m)"
      },
      {
       "t": "+",
       "n": 331,
       "s": "        user_name = true"
      },
      {
       "t": "+",
       "n": 332,
       "s": "      end"
      },
      {
       "t": " ",
       "o": 323,
       "n": 333,
       "s": "      begin"
      },
      {
       "t": " ",
       "o": 324,
       "n": 334,
       "s": "        if user.nil?"
      },
      {
       "t": "-",
       "o": 325,
       "s": "          raise I18n.t('groups.invite_member.errors.not_found', user_name: m)"
      },
      {
       "t": "+",
       "n": 335,
       "s": "          if user_name"
      },
      {
       "t": "+",
       "n": 336,
       "s": "            raise I18n.t('groups.invite_member.errors.user_name_not_found', user_name: m)"
      },
      {
       "t": "+",
       "n": 337,
       "s": "          else"
      },
      {
       "t": "+",
       "n": 338,
       "s": "            raise I18n.t('groups.invite_member.errors.email_not_found', email: m)"
      },
      {
       "t": "+",
       "n": 339,
       "s": "          end"
      },
      {
       "t": " ",
       "o": 326,
       "n": 340,
       "s": "        end"
      },
      {
       "t": "-",
       "o": 327,
       "s": "        if invoked_by_instructor || self.can_invite?(user)"
      },
      {
       "t": "+",
       "n": 341,
       "s": "        if already_invited.exclude?(user) && (invoked_by_instructor || self.can_invite?(user))"
      },
      {
       "t": " ",
       "o": 328,
       "n": 342,
       "s": "          self.add_member(user, set_membership_status)"
      },
      {
       "t": "+",
       "n": 343,
       "s": "          already_invited.add(user)"
      },
      {
       "t": " ",
       "o": 329,
       "n": 344,
       "s": "        end"
      },
      {
       "t": " ",
       "o": 330,
       "n": 345,
       "s": "      rescue StandardError => e"
      },
      {
       "t": " ",
       "o": 331,
       "n": 346,
       "s": "        all_errors << e.message"
      },
      {
       "t": " ",
       "o": 332,
       "n": 347,
       "s": "      end"
      },
      {
       "t": " ",
       "o": 333,
       "n": 348,
       "s": "    end"
      },
      {
       "t": "-",
       "o": 334,
       "s": "    all_errors"
      },
      {
       "t": "+",
       "n": 349,
       "s": "    [all_errors, already_invited]"
      },
      {
       "t": " ",
       "o": 335,
       "n": 350,
       "s": "  end"
      },
      {
       "t": " ",
       "o": 336,
       "n": 351,
       "s": ""
      },
      {
       "t": " ",
       "o": 337,
       "n": 352,
       "s": "  # Add a new member to base"
      }
     ]
    }
   ]
  },
  {
   "path": "app/controllers/groups_controller.rb",
   "hunks": [
    {
     "context": "def invite_member",
     "lines": [
      {
       "t": " ",
       "o": 488,
       "n": 488,
       "s": "      return"
      },
      {
       "t": " ",
       "o": 489,
       "n": 489,
       "s": "    end"
      },
      {
       "t": " ",
       "o": 490,
       "n": 490,
       "s": "    if flash_allowance(:error, allowance_to(:invite_member?, @grouping)).value"
      },
      {
       "t": "-",
       "o": 491,
       "s": "      to_invite = params[:invite_member].split(',')"
      },
      {
       "t": "-",
       "o": 492,
       "s": "      errors = @grouping.invite(to_invite)"
      },
      {
       "t": "+",
       "n": 491,
       "s": "      to_invite = params[:invite_member].to_s.split(/[,\\s]+/).compact_blank"
      },
      {
       "t": "+",
       "n": 492,
       "s": "      errors, invited = @grouping.invite(to_invite)"
      },
      {
       "t": "+",
       "n": 493,
       "s": "      errors = errors.uniq"
      },
      {
       "t": " ",
       "o": 493,
       "n": 494,
       "s": "      if errors.blank?"
      },
      {
       "t": "-",
       "o": 494,
       "s": "        to_invite.each do |i|"
      },
      {
       "t": "-",
       "o": 495,
       "s": "          i = i.strip"
      },
      {
       "t": "-",
       "o": 496,
       "s": "          invited_user = current_course.students.joins(:user).find_by('users.user_name': i)"
      },
      {
       "t": "-",
       "o": 497,
       "s": "          if invited_user&.receives_invite_emails?"
      },
      {
       "t": "+",
       "n": 495,
       "s": "        invited.each do |student|"
      },
      {
       "t": "+",
       "n": 496,
       "s": "          if student.receives_invite_emails?"
      },
      {
       "t": " ",
       "o": 498,
       "n": 497,
       "s": "            NotificationMailer.with(inviter: current_role,"
      },
      {
       "t": "-",
       "o": 499,
       "s": "                                    invited: invited_user,"
      },
      {
       "t": "+",
       "n": 498,
       "s": "                                    invited: student,"
      },
      {
       "t": " ",
       "o": 500,
       "n": 499,
       "s": "                                    grouping: @grouping).grouping_invite_email.deliver_later"
      },
      {
       "t": " ",
       "o": 501,
       "n": 500,
       "s": "          end"
      },
      {
       "t": " ",
       "o": 502,
       "n": 501,
       "s": "        end"
      }
     ]
    }
   ]
  },
  {
   "path": "app/views/assignments/show.html.erb",
   "hunks": [
    {
     "context": "",
     "lines": [
      {
       "t": " ",
       "o": 231,
       "n": 231,
       "s": "                 { id: 'invite-student-form' }) do %>"
      },
      {
       "t": " ",
       "o": 232,
       "n": 232,
       "s": "      <h2><%= t('groups.members.invite') %></h2>"
      },
      {
       "t": " ",
       "o": 233,
       "n": 233,
       "s": "      <p><%= t('groups.members.invite_instructions') %></p>"
      },
      {
       "t": "-",
       "o": 234,
       "s": "      <label for='invite_member'><%= User.human_attribute_name(:user_name).pluralize %></label>"
      },
      {
       "t": "-",
       "o": 235,
       "s": "      <%= text_field_tag 'invite_member', nil, required: true, autocomplete: 'off' %>"
      },
      {
       "t": "+",
       "n": 234,
       "s": "      <label for='invite_member'><%= t('groups.members.invite_label') %></label>"
      },
      {
       "t": "+",
       "n": 235,
       "s": "      <%= text_area_tag 'invite_member', nil, required: true, autocomplete: 'off' %>"
      },
      {
       "t": " ",
       "o": 236,
       "n": 236,
       "s": ""
      },
      {
       "t": " ",
       "o": 237,
       "n": 237,
       "s": "      <section class='dialog-actions'>"
      },
      {
       "t": "-",
       "o": 238,
       "s": "        <%= submit_tag t('groups.members.invite') %>"
      },
      {
       "t": "+",
       "n": 238,
       "s": "        <%= submit_tag t('groups.members.invite'), data: { disable_with: false } %>"
      },
      {
       "t": " ",
       "o": 239,
       "n": 239,
       "s": "        <input type='reset'"
      },
      {
       "t": " ",
       "o": 240,
       "n": 240,
       "s": "               value='<%= t(:cancel) %>'"
      },
      {
       "t": " ",
       "o": 241,
       "n": 241,
       "s": "               id=\"invite-student-modal-close\">"
      }
     ]
    }
   ]
  }
 ],
 "8068": [
  {
   "path": "app/javascript/Components/groups_manager.jsx",
   "hunks": [
    {
     "context": "class GroupsManager extends React.Component {",
     "lines": [
      {
       "t": " ",
       "o": 201,
       "n": 201,
       "s": "  };"
      },
      {
       "t": " ",
       "o": 202,
       "n": 202,
       "s": ""
      },
      {
       "t": " ",
       "o": 203,
       "n": 203,
       "s": "  assign = () => {"
      },
      {
       "t": "-",
       "o": 204,
       "s": "    if (this.studentsTable.state.selection.length === 0) {"
      },
      {
       "t": "+",
       "n": 204,
       "s": "    if (this.studentsTable.getSelectedRows().length === 0) {"
      },
      {
       "t": " ",
       "o": 205,
       "n": 205,
       "s": "      alert(I18n.t(\"groups.select_a_student\"));"
      },
      {
       "t": " ",
       "o": 206,
       "n": 206,
       "s": "      return;"
      },
      {
       "t": "-",
       "o": 207,
       "s": "    } else if (this.groupsTable.state.selection.length === 0) {"
      },
      {
       "t": "+",
       "n": 207,
       "s": "    } else if (this.groupsTable.getSelectedRows().length === 0) {"
      },
      {
       "t": " ",
       "o": 208,
       "n": 208,
       "s": "      alert(I18n.t(\"groups.select_a_group\"));"
      },
      {
       "t": " ",
       "o": 209,
       "n": 209,
       "s": "      return;"
      },
      {
       "t": "-",
       "o": 210,
       "s": "    } else if (this.groupsTable.state.selection.length > 1) {"
      },
      {
       "t": "+",
       "n": 210,
       "s": "    } else if (this.groupsTable.getSelectedRows().length > 1) {"
      },
      {
       "t": " ",
       "o": 211,
       "n": 211,
       "s": "      alert(I18n.t(\"groups.select_only_one_group\"));"
      },
      {
       "t": " ",
       "o": 212,
       "n": 212,
       "s": "      return;"
      },
      {
       "t": " ",
       "o": 213,
       "n": 213,
       "s": "    }"
      },
      {
       "t": " ",
       "o": 214,
       "n": 214,
       "s": ""
      },
      {
       "t": "-",
       "o": 215,
       "s": "    let students = this.studentsTable.state.selection;"
      },
      {
       "t": "-",
       "o": 216,
       "s": "    let grouping_id = this.groupsTable.state.selection[0];"
      },
      {
       "t": "+",
       "n": 215,
       "s": "    let students = this.studentsTable.getSelectedRows();"
      },
      {
       "t": "+",
       "n": 216,
       "s": "    let grouping_id = this.groupsTable.getSelectedRows()[0];"
      },
      {
       "t": " ",
       "o": 217,
       "n": 217,
       "s": ""
      },
      {
       "t": " ",
       "o": 218,
       "n": 218,
       "s": "    $.post({"
      },
      {
       "t": " ",
       "o": 219,
       "n": 219,
       "s": "      url: Routes.global_actions_course_assignment_groups_path("
      }
     ]
    },
    {
     "context": "class GroupsManager extends React.Component {",
     "lines": [
      {
       "t": " ",
       "o": 450,
       "n": 450,
       "s": "  }"
      },
      {
       "t": " ",
       "o": 451,
       "n": 451,
       "s": "}"
      },
      {
       "t": " ",
       "o": 452,
       "n": 452,
       "s": ""
      },
      {
       "t": "-",
       "o": 453,
       "s": "class RawGroupsTable extends React.Component {"
      },
      {
       "t": "+",
       "n": 453,
       "s": "const columnHelper = createColumnHelper();"
      },
      {
       "t": "+",
       "n": 454,
       "s": "class GroupsTable extends React.Component {"
      },
      {
       "t": " ",
       "o": 454,
       "n": 455,
       "s": "  constructor(props) {"
      },
      {
       "t": " ",
       "o": 455,
       "n": 456,
       "s": "    super(props);"
      },
      {
       "t": " ",
       "o": 456,
       "n": 457,
       "s": "    this.state = {"
      },
      {
       "t": "-",
       "o": 457,
       "s": "      filtered: [],"
      },
      {
       "t": "+",
       "n": 458,
       "s": "      columnFilters: [{id: \"inactive\", value: false}],"
      },
      {
       "t": "+",
       "n": 459,
       "s": "      rowSelection: {},"
      },
      {
       "t": " ",
       "o": 458,
       "n": 460,
       "s": "      columns: ["
      },
      {
       "t": "-",
       "o": 459,
       "s": "        {"
      },
      {
       "t": "-",
       "o": 460,
       "s": "          accessor: \"inactive\","
      },
      {
       "t": "+",
       "n": 461,
       "s": "        columnHelper.accessor(\"inactive\", {"
      },
      {
       "t": " ",
       "o": 461,
       "n": 462,
       "s": "          id: \"inactive\","
      },
      {
       "t": "-",
       "o": 462,
       "s": "          width: 0,"
      },
      {
       "t": "-",
       "o": 463,
       "s": "          className: \"rt-hidden\","
      },
      {
       "t": "-",
       "o": 464,
       "s": "          headerClassName: \"rt-hidden\","
      },
      {
       "t": "-",
       "o": 465,
       "s": "          resizable: false,"
      },
      {
       "t": "-",
       "o": 466,
       "s": "        },"
      },
      {
       "t": "-",
       "o": 467,
       "s": "        {"
      },
      {
       "t": "-",
       "o": 468,
       "s": "          show: false,"
      },
      {
       "t": "-",
       "o": 469,
       "s": "          accessor: \"id\","
      },
      {
       "t": "+",
       "n": 463,
       "s": "          size: 0,"
      },
      {
       "t": "+",
       "n": 464,
       "s": "          meta: {"
      },
      {
       "t": "+",
       "n": 465,
       "s": "            className: \"rt-hidden\","
      },
      {
       "t": "+",
       "n": 466,
       "s": "            headerClassName: \"rt-hidden\","
      },
      {
       "t": "+",
       "n": 467,
       "s": "          },"
      },
      {
       "t": "+",
       "n": 468,
       "s": "          enableResizing: false,"
      },
      {
       "t": "+",
       "n": 469,
       "s": "        }),"
      },
      {
       "t": "+",
       "n": 470,
       "s": "        columnHelper.accessor(\"_id\", {"
      },
      {
       "t": " ",
       "o": 470,
       "n": 471,
       "s": "          id: \"_id\","
      },
      {
       "t": "-",
       "o": 471,
       "s": "        },"
      },
      {
       "t": "-",
       "o": 472,
       "s": "        {"
      },
      {
       "t": "-",
       "o": 473,
       "s": "          Header: I18n.t(\"activerecord.models.group.one\"),"
      },
      {
       "t": "-",
       "o": 474,
       "s": "          accessor: \"group_name\","
      },
      {
       "t": "+",
       "n": 472,
       "s": "        }),"
      },
      {
       "t": "+",
       "n": 473,
       "s": "        columnHelper.accessor(\"group_name\", {"
      },
      {
       "t": "+",
       "n": 474,
       "s": "          header: I18n.t(\"activerecord.models.group.one\"),"
      },
      {
       "t": " ",
       "o": 475,
       "n": 475,
       "s": "          id: \"group_name\","
      },
      {
       "t": "-",
       "o": 476,
       "s": "          Cell: row => {"
      },
      {
       "t": "+",
       "n": 476,
       "s": "          cell: props => {"
      },
      {
       "t": " ",
       "o": 477,
       "n": 477,
       "s": "            return ("
      },
      {
       "t": " ",
       "o": 478,
       "n": 478,
       "s": "              <span>"
      },
      {
       "t": "-",
       "o": 479,
       "s": "                <span>{row.value}</span>"
      },
      {
       "t": "+",
       "n": 479,
       "s": "                <span>{props.getValue()}</span>"
      },
      {
       "t": " ",
       "o": 480,
       "n": 480,
       "s": "                <a"
      },
      {
       "t": " ",
       "o": 481,
       "n": 481,
       "s": "                  href=\"#\""
      },
      {
       "t": "-",
       "o": 482,
       "s": "                  onClick={() => this.props.renameGroup(row.original._id, row.value)}"
      },
      {
       "t": "+",
       "n": 482,
       "s": "                  onClick={() => this.props.renameGroup(props.row.original._id, props.getValue())}"
      },
      {
       "t": " ",
       "o": 483,
       "n": 483,
       "s": "                  title={I18n.t(\"groups.rename_group\")}"
      },
      {
       "t": " ",
       "o": 484,
       "n": 484,
       "s": "                >"
      },
      {
       "t": " ",
       "o": 485,
       "n": 485,
       "s": "                  <FontAwesomeIcon icon=\"fa-solid fa-pen\" className=\"icon-right\" />"
      }
     ]
    },
    {
     "context": "class RawGroupsTable extends React.Component {",
     "lines": [
      {
       "t": " ",
       "o": 487,
       "n": 487,
       "s": "              </span>"
      },
      {
       "t": " ",
       "o": 488,
       "n": 488,
       "s": "            );"
      },
      {
       "t": " ",
       "o": 489,
       "n": 489,
       "s": "          },"
      },
      {
       "t": "-",
       "o": 490,
       "s": "          Filter: caseSensitiveTextFilter,"
      },
      {
       "t": "-",
       "o": 491,
       "s": "          filterMethod: caseSensitiveStringFilterMethod,"
      },
      {
       "t": "-",
       "o": 492,
       "s": "        },"
      },
      {
       "t": "-",
       "o": 493,
       "s": "        {"
      },
      {
       "t": "-",
       "o": 494,
       "s": "          Header: I18n.t(\"activerecord.attributes.group.student_memberships\"),"
      },
      {
       "t": "-",
       "o": 495,
       "s": "          accessor: \"members\","
      },
      {
       "t": "-",
       "o": 496,
       "s": "          Cell: row => {"
      },
      {
       "t": "-",
       "o": 497,
       "s": "            if (row.value.length > 0 || !this.props.scanned_exam) {"
      },
      {
       "t": "-",
       "o": 498,
       "s": "              return row.value.map(member => {"
      },
      {
       "t": "+",
       "n": 490,
       "s": "          meta: {"
      },
      {
       "t": "+",
       "n": 491,
       "s": "            filterVariant: \"case-sensitive-text\","
      },
      {
       "t": "+",
       "n": 492,
       "s": "          },"
      },
      {
       "t": "+",
       "n": 493,
       "s": "          filterFn: caseSensitiveStringFilterMethod,"
      },
      {
       "t": "+",
       "n": 494,
       "s": "        }),"
      },
      {
       "t": "+",
       "n": 495,
       "s": "        columnHelper.accessor(\"members\", {"
      },
      {
       "t": "+",
       "n": 496,
       "s": "          header: I18n.t(\"activerecord.attributes.group.student_memberships\"),"
      },
      {
       "t": "+",
       "n": 497,
       "s": "          cell: props => {"
      },
      {
       "t": "+",
       "n": 498,
       "s": "            if (props.getValue().length > 0 || !this.props.scanned_exam) {"
      },
      {
       "t": "+",
       "n": 499,
       "s": "              return props.getValue().map(member => {"
      },
      {
       "t": " ",
       "o": 499,
       "n": 500,
       "s": "                let status;"
      },
      {
       "t": " ",
       "o": 500,
       "n": 501,
       "s": "                if (member[1] === \"pending\") {"
      },
      {
       "t": " ",
       "o": 501,
       "n": 502,
       "s": "                  status = <strong>({member[1]})</strong>;"
      }
     ]
    }
   ]
  }
 ]
};
