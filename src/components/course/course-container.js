import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import CourseItemDashboard from './course-item-dashboard';
import CourseModal from '../modals/course-modal';
import { getUserIdFromAPI } from '../services/user';
import { getProfessorIdByUserIdFromAPI } from '../services/professor';
import { getCoursesByProfessorIdPagined, getCoursesByStudentIdPagined, deleteCourse } from '../services/course';
import { getStudentIdByUserIdFromAPI } from '../services/student';
import { getEnrollmentsByCoursesId } from '../services/enrollment';

class CourseContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            courses: [],
            professorId: "",
            studentId: "",
            typeId: this.props.match.params.slug,
            currentPage: 1,
            totalCount: 0,
            totalPages: 0,
            isLoading: true,
            limit: 10,
            courseModalIsOpen: false,
            editingPermission: this.props.editingPermission || false,
        }
        this.hasUnmounted = false;
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleNewCourseClick = this.handleNewCourseClick.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleSuccessNewCourseSubmission = this.handleSuccessNewCourseSubmission.bind(this);
        this.onScroll = this.onScroll.bind(this);
        window.addEventListener("scroll", this.onScroll, false);
    }

    componentDidMount() {
        const token = localStorage.getItem("token");
        if (token) {
            if (this.state.typeId == 1 || this.state.typeId == 2 || this.state.typeId == 4) {
                getUserIdFromAPI(token)
                    .then(userId => getStudentIdByUserIdFromAPI(userId, token))
                    .then(student => {
                        if (student) {
                            this.setState({
                                studentId: student.students_id
                            }, () => {
                                const { studentId, typeId, currentPage, limit } = this.state;
                                getCoursesByStudentIdPagined(token, studentId, typeId, currentPage, limit)
                                    .then(data => {
                                        this.setState(prevState => ({
                                            courses: [...prevState.courses, ...data.courses],
                                            currentPage: prevState.currentPage + 1,
                                            totalCount: data.total,
                                            totalPages: data.pages,
                                            isLoading: false
                                        }));
                                    })
                                    .catch(error => {
                                        this.setState({ isLoading: false });
                                        console.error("Error getCoursesByStudentIdPagined courses:", error);
                                    });
                            });
                        }
                    })
                    .catch(error => {
                        this.setState({ isLoading: false });
                        console.error("Error getUserIdFromAPI courses:", error);
                    })
            } else if (this.state.typeId == 3 || this.state.typeId == 5 || this.state.typeId == 6) {
                getUserIdFromAPI(token)
                    .then(userId => getProfessorIdByUserIdFromAPI(userId, token))
                    .then(professor => {
                        if (professor) {
                            this.setState({
                                professorId: professor.professors_id
                            }, () => {
                                const { professorId, typeId, currentPage, limit } = this.state;

                                getCoursesByProfessorIdPagined(token, professorId, typeId, currentPage, limit)
                                    .then(data => {
                                        this.setState(prevState => ({
                                            courses: [...prevState.courses, ...data.courses],
                                            currentPage: prevState.currentPage + 1,
                                            totalCount: data.total,
                                            totalPages: data.pages,
                                            isLoading: false,
                                            editingPermission: true
                                        }));
                                    })
                                    .catch(error => {
                                        this.setState({ isLoading: false });
                                        console.error("Error fetching courses:", error);
                                    });
                            });
                        }
                    })
                    .catch(error => {
                        this.setState({ isLoading: false });
                        console.error("Error fetching professor or user data:", error);
                    });
            }
        } else {
            this.props.history.push(`/`);
            return null;
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.loggedInStatus !== this.props.loggedInStatus && this.props.loggedInStatus === "LOGGED_IN") {
            this.getCourses();
        }

        if (this.props.match.params.slug !== prevProps.match.params.slug) {
            this.setState({
                typeId: this.props.match.params.slug || null
            }, () => {
                this.getCourses(token);
            });

        }
    }

    componentWillUnmount() {
        window.onscroll = null;
        this.hasUnmounted = true;
    }

    onScroll() {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
            if (this.state.typeId) {
                if (this.state.currentPage <= this.state.totalPages && !this.state.isLoading) {
                    const token = localStorage.getItem("token");
                    const { professorId, typeId, currentPage, limit } = this.state;
                    this.setState({ isLoading: true });
                    getCoursesByProfessorIdPagined(token, professorId, typeId, currentPage, limit)
                        .then(data => {
                            if (!this.hasUnmounted) {
                                this.setState(prevState => ({
                                    courses: [...prevState.courses, ...data.courses],
                                    currentPage: prevState.currentPage + 1,
                                    totalCount: data.total,
                                    totalPages: data.pages,
                                    isLoading: false
                                }));
                            }
                        })
                        .catch(error => {
                            console.error("Error fetching courses:", error);
                            if (!this.hasUnmounted) {
                                this.setState({ isLoading: false });
                            }
                        });
                }
            }
        }
    }

    handleSuccessNewCourseSubmission(course) {
        this.setState({
            courses: [course].concat(this.state.courses),
            courseModalIsOpen: false
        })

    }

    handleModalClose() {
        this.setState({
            courseModalIsOpen: false
        })
    }

    handleNewCourseClick() {
        this.setState({
            courseModalIsOpen: true
        });
    }

    handleDeleteClick(course) {
        const courseId = course.courses_id;
        const token = localStorage.getItem("token");
        getEnrollmentsByCoursesId(courseId, token)
            .then(response => {
                if (Array.isArray(response) && response.length === 0) {
                    deleteCourse(course.courses_id, token)
                        .then(response => {
                            this.setState(prevState => ({
                                courses: prevState.courses.filter(c => c.courses_id !== course.courses_id)
                            }));
                        })
                }
            })
    }

    render() {
        const { courses = [], typeId, editingPermission, professorId } = this.state;
        const { loggedInStatus } = this.props;

        if (loggedInStatus !== "LOGGED_IN") {
            this.props.history.push(`/`);
            return null;
        }

        return (
            <div className="course-content-page-wrapper">
                <CourseModal
                    modalIsOpen={this.state.courseModalIsOpen}
                    handleModalClose={this.handleModalClose}
                    handleSuccessNewCourseSubmission={this.handleSuccessNewCourseSubmission}
                    professorId={professorId}
                />

                {!this.state.isLoading && courses.length === 0 ? (
                    <div>
                        <p>No hay cursos disponibles</p>
                        {(typeId == 3 || typeId == 5) && (
                            <div className="new-course-link">
                                <a className="icon-plus-circle" onClick={this.handleNewCourseClick}>
                                    <FontAwesomeIcon icon="plus-circle" />
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    courses.map(course => {
                        return (
                            <div key={course.courses_id}>
                                <CourseItemDashboard
                                    key={course.id}
                                    course={course}
                                    typeId={typeId}
                                    editingPermission={editingPermission}
                                    handleNewCourseClick={this.handleNewCourseClick}
                                    handleDeleteClick={this.handleDeleteClick}
                                />
                            </div>
                        );
                    })
                )}
                {this.state.isLoading && (
                    <div className='content-loader'>
                        <FontAwesomeIcon icon="spinner" spin />
                    </div>
                )}
            </div>
        );
    }
}
export default withRouter(CourseContainer);
